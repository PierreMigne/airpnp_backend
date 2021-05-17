import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { User } from '../auth/entities/user.entity';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {
  private logger = new Logger('PropertyRepository');

  async getAllProperties(
    filterDto: GetPropertiesFilterDto,
  ): Promise<Property[]> {
    const { category, location, peoples, options } = filterDto;
    const query = this.createQueryBuilder('property');
    query.leftJoinAndSelect('property.images', 'images');
    query.orderBy('images.id', 'ASC');

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
    property.options = options;
    property.price = price;
    property.isVisible = false;
    property.createdAt = new Date();
    property.user = user;

    try {
      await property.save();
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
