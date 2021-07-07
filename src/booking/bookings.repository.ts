import { EntityRepository, Repository } from 'typeorm';
import { Booking } from './entities/bookings.entity';
import { User } from '../auth/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Logger, InternalServerErrorException } from '@nestjs/common';

@EntityRepository(Booking)
export class BookingRepository extends Repository<Booking> {
  private logger = new Logger('BookingRepository');

  async createBooking(createBookingDto: CreateBookingDto, user: User, propertyId: number): Promise<Booking> {
    const { startDate, endDate, price, peoples } = createBookingDto;
    const booking = new Booking();
    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.price = price;
    booking.peoples = peoples;
    booking.createdAt = new Date();
    booking.user = user;
    booking.propertyId = propertyId;

    try {
      await booking.save();
    } catch (error) {
      this.logger.error(`Data: ${JSON.stringify(createBookingDto)}`, error.stack);
      throw new InternalServerErrorException();
    }

    // delete booking.user;
    return booking;
  }
}
