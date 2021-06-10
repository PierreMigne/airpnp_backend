import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { User } from '../auth/entities/user.entity';
import { Option } from 'src/options/entities/options.entity';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {
  private logger = new Logger('PropertyRepository');

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

  private getQueryOfAllProperties(filterDto?: GetPropertiesFilterDto) {
    const query = this.createQueryBuilder('property');
    query.leftJoinAndSelect('property.images', 'images');
    query.leftJoinAndSelect('property.user', 'user');
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
      if (options) {
        options.forEach((option) => {
          query.andWhere("property.options ILIKE ('%" + option + "%')");
        });
      }
      if (peoples) {
        query.andWhere('(property.peoples = :peoples)', { peoples });
      }
    }
    return query;
  }

  async getAllPropertiesVisibles(
    filterDto: GetPropertiesFilterDto,
  ): Promise<Property[]> {
    const query = this.getQueryOfAllProperties(filterDto);
    query.andWhere('(property.isVisible = true)');
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
    const query = this.getQueryOfAllProperties();
    query.andWhere('(property.isVisible = false)');
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
    property.isVisible = false;
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
