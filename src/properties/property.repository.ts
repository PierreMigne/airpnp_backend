import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository, getManager } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { User } from '../auth/entities/user.entity';
import { Option } from 'src/options/entities/options.entity';
import { PropertyStatus } from './property-status.enum';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {
  private logger = new Logger('PropertyRepository');
  private entityManager = getManager();

  private async getQueryOfAllProperties(filterDto?: GetPropertiesFilterDto) {
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
      if (options) {
        // Return Properties who have valid Options
        let optionsQuery = `SELECT "propertyId" FROM "option" GROUP BY "propertyId" HAVING `;
        options.forEach((option: string, index: number) => {
          // Concat all options for each property
          optionsQuery += `array_to_string(array_agg("options"), ',') ILIKE ('%` + option + `%')`;
          if (index != options.length - 1) {
            optionsQuery += ` AND `;
          }
        });
        const optionsResult = await this.entityManager.query(optionsQuery);

        if (optionsResult && optionsResult.length > 0) {
          const propertyIds = optionsResult.map((option) => +option.propertyId);
          // Return only valid Properties
          query.andWhere('property.id IN (:...ids)', { ids: propertyIds });
        } else {
          query.andWhere('false');
        }
      }
    }
    return query;
  }

  async getAllPropertiesVisibles(filterDto: GetPropertiesFilterDto): Promise<Property[]> {
    const query = await this.getQueryOfAllProperties(filterDto);
    const status = PropertyStatus.VALIDE;
    query.andWhere('(property.status = :status)', { status });
    try {
      const properties = await query.getMany();
      return properties;
    } catch (error) {
      this.logger.error(`Impossible de trouver d'hébergements. Filtres: ${JSON.stringify(filterDto)}`, error.stack);
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

  async createProperty(createPropertyDto: CreatePropertyDto, user: User): Promise<Property> {
    const { title, category, location, surface, peoples, beds, description, options, price } = createPropertyDto;

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
      this.logger.error(`Data: ${JSON.stringify(createPropertyDto)}`, error.stack);
      throw new InternalServerErrorException();
    }

    delete property.user;
    return property;
  }

  async getPropertiesByUser(user: User) {
    const query = this.createQueryBuilder('property');
    query.leftJoinAndSelect('property.images', 'images');
    query.leftJoinAndSelect('property.user', 'user');
    query.leftJoinAndSelect('property.options', 'listoptions');
    query.orderBy('images.id', 'ASC');

    query.where('property.userId = :userId', { userId: user.id });
    // return query;

    try {
      const properties = await query.getMany();
      return properties;
    } catch (error) {
      this.logger.error(`Impossible de trouver d'hébergements.`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getPropertyByIdAndUser(id: number, user: User) {
    const query = this.createQueryBuilder('property');
    query.leftJoinAndSelect('property.images', 'images');
    query.leftJoinAndSelect('property.user', 'user');
    query.leftJoinAndSelect('property.options', 'listoptions');
    query.orderBy('images.id', 'ASC');

    query.where('property.id = :id', { id: id });
    query.andWhere('property.userId = :userId', { userId: user.id });

    try {
      const properties = await query.getOne();
      return properties;
    } catch (error) {
      this.logger.error(`Impossible de trouver d'hébergement avec l'ID ${id}.`, error.stack);
      throw new InternalServerErrorException();
    }
  }
}
