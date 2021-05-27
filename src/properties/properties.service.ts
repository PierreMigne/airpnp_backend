import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { Property } from './entities/property.entity';
import { PropertyCategories } from './property-categories.enum';
import { PropertyRepository } from './property.repository';
import { User } from '../auth/entities/user.entity';
import { FavoriteRepository } from '../favorites/favorties.repository';
import { Favorite } from 'src/favorites/entities/favorites.entity';
import { Booking } from '../booking/entities/bookings.entity';
import { CreateBookingDto } from 'src/booking/dto/create-booking.dto';
import { BookingRepository } from '../booking/bookings.repository';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(PropertyRepository)
    private propertyRepository: PropertyRepository,
    @InjectRepository(FavoriteRepository)
    private favoriteRepository: FavoriteRepository,
    @InjectRepository(BookingRepository)
    private bookingRepository: BookingRepository,
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
      relations: ['images'],
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
    return await this.propertyRepository.getAllProperties(filterDto);
  }

  async getPropertyById(id: number): Promise<Property> {
    const found = await this.propertyRepository.findOne(id, {
      relations: ['images'],
    });
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
      relations: ['images'],
    });
    if (!found) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }
    return found;
  }

  // a supprimer ?
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

  async savePropertyFile(property): Promise<any> {
    await this.propertyRepository.save(property);
  }

  async deleteProperty(id: number, user: User): Promise<Property[]> {
    const result = await this.propertyRepository.delete({
      id,
      userId: user.id,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }

    const found = await this.propertyRepository.find({
      where: { userId: user.id },
      relations: ['images'],
    });

    if (!found) {
      throw new NotFoundException(
        `Cet utilisateur n'a pas d'hébergements ou n'existe pas.`,
      );
    }
    return found;
  }

  async savePropertyInFavorite(
    propertyId: number,
    user: User,
  ): Promise<Favorite> {
    try {
      return await this.favoriteRepository.save({
        property: { id: propertyId },
        user,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // async createBooking(
  //   propertyId: number,
  //   user: User,
  //   createBookingDto: CreateBookingDto,
  // ): Promise<Booking> {
  //   try {
  //     return await this.bookingRepository.save({
  //       property: { id: propertyId },
  //       user,
  //       createBookingDto,
  //     });
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }
  async createBooking(
    propertyId: number,
    user: User,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    return await this.bookingRepository.createBooking(
      createBookingDto,
      user,
      propertyId,
    );
  }

  async getBookings(user: User): Promise<Booking[]> {
    const found = await this.bookingRepository.find({
      where: { user: user.id },
      relations: ['property'],
      // relations: ['property', 'user'],
    });
    if (!found) {
      throw new NotFoundException(`Vous n'avez pas de réservation !`);
    }
    return found;
  }

  async getBookingsById(propertyId: number): Promise<Booking[]> {
    const found = await this.bookingRepository.find({
      where: { propertyId: propertyId },
      relations: ['property'],
      // relations: ['property', 'user'],
    });
    if (!found) {
      throw new NotFoundException(`Vous n'avez pas de réservation !`);
    }
    return found;
  }

  async getFavorites(user: User): Promise<Favorite[]> {
    const found = await this.favoriteRepository.find({
      where: { user: user.id },
      relations: ['property'],
      // relations: ['property', 'user'],
    });
    if (!found) {
      throw new NotFoundException(`Vous n'avez pas d'hébergement en favoris !`);
    }
    return found;
  }

  async deleteFavoriteByPropertyIdAndUser(
    propertyId: number,
    user: User,
  ): Promise<any> {
    const result = await this.favoriteRepository.delete({
      user: { id: user.id },
      property: { id: propertyId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Le favoris avec l'ID 'existe pas !`);
    }

    const found = await this.getFavorites(user);
    return found;
  }

  async deleteFavorites(id: number, user: User): Promise<any> {
    const result = await this.favoriteRepository.delete({
      id,
      user: { id: user.id },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Le favoris avec l'ID ${id} n'existe pas !`);
    }

    const found = await this.getFavorites(user);
    return found;
  }
}
