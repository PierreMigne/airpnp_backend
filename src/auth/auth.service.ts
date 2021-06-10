import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { AuthSignUpDto } from './dto/auth-signUp.dto';
import { User } from './entities/user.entity';
import { EditUserDto } from './dto/editUser.dto';
import { EditPasswordDto } from './dto/editPassword.dto.';
import { ImageRepository } from '../images/images.repository';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(ImageRepository)
    private imageRepository: ImageRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
    typescript: true,
  });

  account = this.stripe.accounts.create({
    type: 'express',
  });

  createCustomer = async (email) => {
    const params: Stripe.CustomerCreateParams = {
      email: email,
      name: '',
      description: 'test customer',
    };
    const customer: Stripe.Customer = await this.stripe.customers.create(
      params,
    );
    console.log(customer.id);
    return customer.id;
  };

  createAccountLinks = async (customerId) => {
    const id = customerId;
    console.log(id);

    const accountLinks = await this.stripe.accountLinks.create({
      account: id,
      refresh_url: 'http://localhost:4200/home',
      return_url: 'http://localhost:4200/home',
      type: 'account_onboarding',
    });
    console.log(accountLinks);
  };

  async signUp(authSignUpDto: AuthSignUpDto): Promise<void> {
    await this.mailService.sendUserWelcome(authSignUpDto);
    return await this.userRepository.signUp(authSignUpDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const email = await this.userRepository.validateUserPassword(
      authCredentialsDto,
    );
    if (!email) {
      throw new UnauthorizedException('Email ou mot de passe invalide.');
    }
    const payload: JwtPayload = { email };
    const accessToken = await this.jwtService.sign(payload);
    // const stripeCustomerId = await this.createCustomer(email);
    // this.createAccountLinks(stripeCustomerId);
    return { accessToken };
  }

  async getUser(user: User): Promise<User> {
    const found = await this.userRepository.findOne({ id: user.id });
    if (!found) {
      throw new NotFoundException(`L'utilisateur ${user} n'existe pas !`);
    }
    return found;
  }

  async isUserAdmin(user: User): Promise<boolean> {
    const found = await this.userRepository.findOne({ id: user.id });
    if (!found) {
      throw new NotFoundException(`L'utilisateur ${user} n'existe pas !`);
    }
    return found.isAdmin;
  }

  async getUserByEmail(email: string): Promise<User> {
    const found = await this.userRepository.findOne(email);
    if (!found) {
      throw new NotFoundException(`L'email ${email} n'existe pas !`);
    }
    return found;
  }

  async updateUser(user: User, editUserDto: EditUserDto): Promise<User> {
    return await this.userRepository.editUser(editUserDto, user);
  }

  async saveUserFile(user): Promise<any> {
    await this.userRepository.save(user);
  }
  async deleteUserFile(userId): Promise<any> {
    await this.imageRepository.delete(userId);
  }

  async editPassword(
    user: User,
    editPasswordDto: EditPasswordDto,
  ): Promise<User> {
    return await this.userRepository.editPassword(editPasswordDto, user);
  }

  async forgotPassword(email: JwtPayload): Promise<{ accessToken: string }> {
    if (!email) {
      throw new NotFoundException("Cet email n'éxiste pas.");
    }

    const payload: JwtPayload = email;

    const accessToken = await this.jwtService.sign(payload);
    await this.mailService.sendUserForgotPassword(email.email, accessToken);
    return { accessToken };
  }

  async resetPassword(
    user: User,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<User> {
    return await this.userRepository.resetPassword(resetPasswordDto, user);
  }

  // async deleteUser(id: number, user: User): Promise<User[]> {
  //   const result = await this.userRepository.delete({
  //     id,
  //     // userId: user.id,
  //   });

  //   if (result.affected === 0) {
  //     throw new NotFoundException(
  //       `L'utilisateur avec l'ID ${id} n'existe pas !`,
  //     );
  //   }

  //   const found = await this.userRepository.find({
  //     where: { userId: user.id },
  //     relations: ['image'],
  //   });

  //   if (!found) {
  //     throw new NotFoundException(
  //       `Cet utilisateur n'a pas d'hébergements ou n'existe pas.`,
  //     );
  //   }
  //   return found;
  // }
}
