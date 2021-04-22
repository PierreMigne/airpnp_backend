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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
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
  async editPassword(
    user: User,
    editPasswordDto: EditPasswordDto,
  ): Promise<User> {
    return await this.userRepository.editPassword(editPasswordDto, user);
  }
}
