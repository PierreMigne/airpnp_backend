import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { Property } from './entities/property.entity';
import { PropertyCategories } from './property-categories.enum';
import { PropertyRepository } from './property.repository';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(PropertyRepository)
    private propertyRepository: PropertyRepository,
  ) {}

  async createProperty(
    createPropertyDto: CreatePropertyDto,
    user: User,
  ): Promise<Property> {
    return this.propertyRepository.createProperty(createPropertyDto, user);
  }

  async getPropertiesByUser(user: User): Promise<Property[]> {
    const found = await this.propertyRepository.find({
      where: { userId: user.id },
    });
    if (!found) {
      throw new NotFoundException(
        `Cet utilisateur n'a pas d'hébergements ou n'existe pas.`,
      );
    }
    return found;
  }
  async getAllProperties(
    filterDto: GetPropertiesFilterDto,
  ): Promise<Property[]> {
    return this.propertyRepository.getAllProperties(filterDto);
  }

  async getPropertyById(id: number): Promise<Property> {
    const found = await this.propertyRepository.findOne(id);
    if (!found) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }
    return found;
  }
  async getPropertyByIdAndUser(id: number, user: User): Promise<Property> {
    const found = await this.propertyRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!found) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }
    return found;
  }

  async updatePropertyCategories(
    id: number,
    category: PropertyCategories,
    user: User,
  ): Promise<Property> {
    const property = await this.getPropertyByIdAndUser(id, user);
    property.category = category;
    await property.save();
    return property;
  }

  async updateProperty(
    id: number,
    user: User,
    createPropertyDto: CreatePropertyDto,
  ): Promise<any> {
    const updatedProperty = await this.propertyRepository.update(
      { id, userId: user.id },
      createPropertyDto,
    );
    if (updatedProperty.affected === 0) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }
  }

  async deleteProperty(id: number, user: User): Promise<void> {
    const result = await this.propertyRepository.delete({
      id,
      userId: user.id,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }
  }
}
