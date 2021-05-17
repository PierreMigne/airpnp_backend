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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(ImageRepository)
    private imageRepository: ImageRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authSignUpDto: AuthSignUpDto): Promise<void> {
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
    return { accessToken };
  }

  async getUser(user: User): Promise<User> {
    const found = await this.userRepository.findOne({ id: user.id });
    if (!found) {
      throw new NotFoundException(`L'utilisateur ${user} n'existe pas !`);
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
