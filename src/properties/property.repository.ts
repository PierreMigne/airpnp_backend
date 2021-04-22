import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { User } from '../auth/entities/user.entity';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {
  private logger = new Logger('PropertyRepository');

  async getProperties(
    filterDto: GetPropertiesFilterDto,
    user: User,
  ): Promise<Property[]> {
    const { category, search } = filterDto;
    const query = this.createQueryBuilder('property');

    query.where('property.userId = :userId', { userId: user.id });

    if (category) {
      query.andWhere('property.category = :category', { category });
    }

    if (search) {
      query.andWhere(
        '(property.title LIKE :search OR property.description LIKE :search OR property.category LIKE :search OR property.location LIKE :search OR property.options LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      const properties = await query.getMany();
      return properties;
    } catch (error) {
      this.logger.error(
        `Impossible de trouver d'hébergements pour cet utilisateur. Filters: ${JSON.stringify(
          filterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getAllProperties(
    filterDto: GetPropertiesFilterDto,
  ): Promise<Property[]> {
    const { category, search } = filterDto;
    const query = this.createQueryBuilder('property');

    if (category) {
      query.andWhere('property.category = :category', { category });
    }

    if (search) {
      query.andWhere(
        '(property.title LIKE :search OR property.description LIKE :search OR property.category LIKE :search OR property.location LIKE :search OR property.options LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      const properties = await query.getMany();
      return properties;
    } catch (error) {
      this.logger.error(
        `Impossible de trouver d'hébergements. Filters: ${JSON.stringify(
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
      photos,
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
    property.photos = photos;
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
