import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { AuthSignUpDto } from './dto/auth-signUp.dto';
import { User } from './entities/user.entity';
import { GetUser } from './get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { EditUserDto } from './dto/editUser.dto';
import { EditPasswordDto } from './dto/editPassword.dto.';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body(ValidationPipe) authSignUpDto: AuthSignUpDto): Promise<void> {
    return this.authService.signUp(authSignUpDto);
  }

  @Post('signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard())
  getUser(@GetUser() user: User): Promise<User> {
    return this.authService.getUser(user);
  }

  @Put('profile/edit')
  @UseGuards(AuthGuard())
  editUser(
    @Body(ValidationPipe) editUserDto: EditUserDto,
    @GetUser() user: User,
  ): Promise<User> {
    return this.authService.updateUser(user, editUserDto);
  }

  @Put('profile/edit/password')
  @UseGuards(AuthGuard())
  editPassword(
    @Body(ValidationPipe) editPasswordDto: EditPasswordDto,
    @GetUser() user: User,
  ): Promise<User> {
    return this.authService.editPassword(user, editPasswordDto);
  }
}
