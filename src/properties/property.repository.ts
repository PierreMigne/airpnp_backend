import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository, getManager } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { User } from '../auth/entities/user.entity';
import { Option } from 'src/options/entities/options.entity';
import { PropertyStatusDto } from './dto/property-status.dto';
import { PropertyStatus } from './property-status.enum';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {
  private logger = new Logger('PropertyRepository');
  private entityManager = getManager();

  // async getAllProperties(
  //   filterDto: GetPropertiesFilterDto,
  // ): Promise<Property[]> {
  //   const { category, location, peoples, options } = filterDto;
  //   const query = this.createQueryBuilder('property');
  //   query.leftJoinAndSelect('property.images', 'images');
  //   query.orderBy('images.id', 'ASC');

  //   if (category) {
  //     query.andWhere('property.category IN (:...category)', { category });
  //   }
  //   if (location) {
  //     query.andWhere('property.location ILIKE (:location)', {
  //       location: `%${location}%`,
  //     });
  //   }
  //   if (options) {
  //     options.forEach((option) => {
  //       query.andWhere("property.options ILIKE ('%" + option + "%')");
  //     });
  //   }
  //   if (peoples) {
  //     query.andWhere('(property.peoples = :peoples)', { peoples });
  //   }
  //   query.andWhere('(property.isVisible = true)');

  //   try {
  //     const properties = await query.getMany();
  //     return properties;
  //   } catch (error) {
  //     this.logger.error(
  //       `Impossible de trouver d'hébergements. Filtres: ${JSON.stringify(
  //         filterDto,
  //       )}`,
  //       error.stack,
  //     );
  //     throw new InternalServerErrorException();
  //   }
  // }

  private queryOption(options) {
    const queryOption = this.entityManager.createQueryBuilder(
      Option,
      'options',
    );
    queryOption.select();
    queryOption.where('options.options IN (:options)', { options });

    const queryPropertyOption = this.entityManager.createQueryBuilder(
      Property,
      'property',
    );
    queryPropertyOption.where((qb) => {
      const subQuery = qb
        .subQuery()
        .select('property.id')
        .from(Property, 'property')
        .innerJoinAndSelect(
          '(' + queryOption.getQuery() + ')',
          'qOption',
          'qOption.propertyId = property.id',
        )
        .getQuery();
      return subQuery;
    });
  }

  // QueryPropertyOption : SELECT id FROM property INNER JOIN {{QueryOption}} ON options.propertyId = property.id

  private async getQueryOfAllProperties(filterDto?: GetPropertiesFilterDto) {
    // const query = this.createQueryBuilder('property');
    const query = this.createQueryBuilder('property');
    query.leftJoinAndSelect('property.images', 'images');
    query.leftJoinAndSelect('property.user', 'user');
    query.leftJoinAndSelect('property.options', 'listoptions');
    query.orderBy('images.id', 'ASC');

    if (filterDto) {
      const { category, location, peoples, options } = filterDto;
      if (category) {
        query.andWhere('property.category IN (:...category)', { category });
      }
      if (location) {
        query.andWhere('property.location ILIKE (:location)', {
          location: `%${location}%`,
        });
      }
      if (peoples) {
        query.andWhere('(property.peoples = :peoples)', { peoples });
      }
      // if (options) {
      //   options.forEach((option: string) => {
      //     query.andWhere("listoptions.options ILIKE ('%" + option + "%')");
      //   });
      // }
      if (options) {
        const queryOption = await this
          .createQueryBuilder('option')
          .select()
          .from(Option, 'optionFrom')
          .where('option.options IN (optionsArr)', { optionsArr: options });
        // queryOption.from(Option, 'option');

        const queryPropertyOption = await this.entityManager.createQueryBuilder(
          Property,
          'property',
        );
        queryPropertyOption.where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('property.id')
            .from(Property, 'property')
            .innerJoinAndSelect(
              '(' + queryOption.getQuery() + ')',
              'qOption',
              'qOption.propertyId = property.id',
            )
            .getQuery();
          return subQuery;
        });
        
        query.andWhere(
          'property.id IN (' + queryPropertyOption.getRawMany() + ')',
        );
        console.log(query.getQueryAndParameters());
      }
    }
    return query;
  }

  async getAllPropertiesVisibles(
    filterDto: GetPropertiesFilterDto,
  ): Promise<Property[]> {
    const query = await this.getQueryOfAllProperties(filterDto);
    const status = PropertyStatus.VALIDE;
    query.andWhere('(property.status = :status)', { status });
    try {
      const properties = await query.getMany();
      return properties;
    } catch (error) {
      this.logger.error(
        `Impossible de trouver d'hébergements. Filtres: ${JSON.stringify(
          filterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getAllPropertiesNotVisibles(): Promise<Property[]> {
    const query = await this.getQueryOfAllProperties();
    const status = PropertyStatus.ATTENTE;
    query.andWhere('(property.status = :status)', { status });
    try {
      const properties = await query.getMany();
      return properties;
    } catch (error) {
      this.logger.error(`Impossible de trouver d'hébergements.`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createProperty(
    createPropertyDto: CreatePropertyDto,
    user: User,
  ): Promise<Property> {
    const {
      title,
      category,
      location,
      surface,
      peoples,
      beds,
      description,
      options,
      price,
    } = createPropertyDto;

    const property = new Property();
    property.title = title;
    property.category = category;
    property.location = location;
    property.surface = surface;
    property.peoples = peoples;
    property.beds = beds;
    property.description = description;
    // property.options = options;
    property.price = price;
    property.status = PropertyStatus.ATTENTE;
    property.createdAt = new Date();
    property.user = user;

    const optionsArrayWithoutSpaces = options.replace(/ /g, '').split(',');

    try {
      await property.save();

      optionsArrayWithoutSpaces.forEach(async (optionItem: string) => {
        const option = new Option();
        option.propertyId = property.id;
        option.options = optionItem;
        await option.save();
      });
    } catch (error) {
      this.logger.error(
        `Data: ${JSON.stringify(createPropertyDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }

    delete property.user;
    return property;
  }
}
