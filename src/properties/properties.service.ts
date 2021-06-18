import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ParseBoolPipe,
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
import { OptionRepository } from '../options/options.repository';

import { Option } from 'src/options/entities/options.entity';
import { PropertyStatusDto } from './dto/property-status.dto';
import { PropertyStatus } from './property-status.enum';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { In } from 'typeorm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PropertiesService {
  constructor(
    private mailService: MailService,
    @InjectRepository(PropertyRepository)
    private propertyRepository: PropertyRepository,
    @InjectRepository(FavoriteRepository)
    private favoriteRepository: FavoriteRepository,
    @InjectRepository(BookingRepository)
    private bookingRepository: BookingRepository,
    @InjectRepository(OptionRepository)
    private optionRepository: OptionRepository,
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

  async getAllPropertiesVisibles(
    filterDto: GetPropertiesFilterDto,
  ): Promise<Property[]> {
    return await this.propertyRepository.getAllPropertiesVisibles(filterDto);
  }
  async getAllPropertiesNotVisibles(): Promise<Property[]> {
    return await this.propertyRepository.getAllPropertiesNotVisibles();
  }

  async countAllPropertiesWaiting(): Promise<number> {
    return await this.propertyRepository.count({
      where: { status: PropertyStatus.ATTENTE },
    });
  }

  async getPropertyById(id: number): Promise<Property> {
    const found = await this.propertyRepository.findOne(id, {
      where: { status: PropertyStatus.VALIDE },
      relations: ['images', 'user'],
    });
    if (!found) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }
    return found;
  }

  async getPropertyByIdNotVisible(id: number): Promise<Property> {
    const found = await this.propertyRepository.findOne(id, {
      relations: ['images', 'user'],
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
      relations: ['images', 'user'],
    });
    if (!found) {
      throw new NotFoundException(
        `L'hébergement avec l'ID ${id} n'existe pas !`,
      );
    }
    return found;
  }

  async updatePropertyStatus(
    propertyId: number,
    propertyStatusDto: PropertyStatusDto,
  ): Promise<Property> {
    const { status, reasons } = propertyStatusDto;
    const property = await this.getPropertyByIdNotVisible(propertyId);
    property.status = status;

    if (status === PropertyStatus.VALIDE) {
      await this.mailService.sendUserValidProperty(
        property.user.email,
        property.user.firstname,
      );
    } else if (status === PropertyStatus.INVALIDE) {
      await this.mailService.sendUserInvalidProperty(
        property.user.email,
        property.user.firstname,
        reasons,
      );
    }
    await property.save();
    return property;
  }

  //on update property.status = PropertyStatus.ATTENTE    a rajouter
  // async updateProperty(
  //   id: number,
  //   user: User,
  //   createPropertyDto: CreatePropertyDto,
  // ): Promise<any> {
  //   const updatedProperty = await this.propertyRepository.update(
  //     { id, userId: user.id },
  //     createPropertyDto,
  //   );

  //   if (updatedProperty.affected === 0) {
  //     throw new NotFoundException(
  //       `L'hébergement avec l'ID ${id} n'existe pas !`,
  //     );
  //   }
  // }

  async updateProperty(
    id: number,
    user: User,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<any> {
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
    } = updatePropertyDto;
    const property = await this.propertyRepository.findOne({
      where: { id, userId: user.id },
    });

    property.status = PropertyStatus.ATTENTE;

    if (title) {
      property.title = title;
    }
    if (category) {
      property.category = category;
    }
    if (location) {
      property.location = location;
    }
    if (surface) {
      property.surface = surface;
    }
    if (peoples) {
      property.peoples = peoples;
    }
    if (beds) {
      property.beds = beds;
    }
    if (description) {
      property.description = description;
    }
    if (price) {
      property.price = price;
    }

    const optionArray = [];
    property.options.forEach((option) => {
      optionArray.push(option.id);
    });

    this.removeOptions(optionArray);
    const optionsArrayWithoutSpaces = options.replace(/ /g, '').split(',');
    optionsArrayWithoutSpaces.forEach(async (optionItem: any) => {
      const optionb = new Option();
      optionb.propertyId = id;
      optionb.options = optionItem;
      await optionb.save();
    });

    property.options = options.option;
    await property.save();

    return property;
  }
  private async removeOptions(ids: string[]) {
    const entities = await this.optionRepository.findByIds(ids);
    if (!entities) {
      throw new NotFoundException(`Aucune option trouvée.`);
    }
    return this.optionRepository.remove(entities);
  }

  // ********************************************************************************************************************************************************************************************
  // ********************************************************************************************************************************************************************************************
  // ********************************************************************************************************************************************************************************************
  // ********************************************************************************************************************************************************************************************
  // ********************************************************************************************************************************************************************************************
  // ********************************************************************************************************************************************************************************************
  // ********************************************************************************************************************************************************************************************
  async savePropertyFile(property: Property): Promise<any> {
    property.status = PropertyStatus.ATTENTE;
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

  async createBooking(
    propertyId: number,
    user: User,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    try {
      return await this.bookingRepository.createBooking(
        createBookingDto,
        user,
        propertyId,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBookings(user: User): Promise<Booking[]> {
    const found = await this.bookingRepository.find({
      where: { user: user.id },
      // relations: ['property'],
      // relations: ['property', 'user'],
      order: { createdAt: 'DESC' },
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
