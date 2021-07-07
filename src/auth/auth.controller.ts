import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync, rmdirSync } from 'fs';
import { Image } from 'src/images/entities/images.entity';
import { extname } from 'path';
import { JwtPayload } from './jwt-payload.interface';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body(ValidationPipe) authSignUpDto: AuthSignUpDto): Promise<void> {
    return this.authService.signUp(authSignUpDto);
  }

  @Post('signin')
  signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<any> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard())
  getUser(@GetUser() user: User): Promise<User> {
    return this.authService.getUser(user);
  }

  @Get('all')
  @UseGuards(AuthGuard())
  getAllUsers(): Promise<User[]> {
    return this.authService.getAllUsers();
  }

  @Get('allUsersAndAdmins')
  @UseGuards(AuthGuard())
  getAllUsersAndAdmins(): Promise<User[]> {
    return this.authService.getAllUsersAndAdmins();
  }

  @Put('all/:userId/role')
  @UseGuards(AuthGuard())
  updateUserRole(@Body() role: any, @Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.authService.updateUserRole(userId, role.role);
  }

  @Get('admin/count')
  @UseGuards(AuthGuard())
  countAllAdmins(): Promise<number> {
    return this.authService.countAllAdmins();
  }

  @Put('profile/edit')
  @UseGuards(AuthGuard())
  editUser(@Body(ValidationPipe) editUserDto: EditUserDto, @GetUser() user: User): Promise<User> {
    return this.authService.updateUser(user, editUserDto);
  }

  @Put('profile/edit/password')
  @UseGuards(AuthGuard())
  editPassword(@Body(ValidationPipe) editPasswordDto: EditPasswordDto, @GetUser() user: User): Promise<User> {
    return this.authService.editPassword(user, editPasswordDto);
  }

  @Post('profile/:id/uploads')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const userId = req.params.id;
          const path = './uploads/profile/' + userId;
          if (!existsSync(path)) {
            mkdirSync(path, { recursive: true });
          } else {
            rmdirSync(path, { recursive: true });
            mkdirSync(path, { recursive: true });
          }
          return cb(null, path);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async addUserFile(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // if user already have an image, we delete this because type = Image and not Image[]
    if (user.image) {
      this.authService.deleteUserFile(user.image.id);
    }
    const image = new Image();
    image.property = null;
    image.user = user;
    image.file = file.filename;
    user.image = image;

    this.authService.saveUserFile(user);
    return {
      response: 'success',
      image: file.filename,
    };
  }

  @Get('profile/uploads/:id/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res, @Param('id', ParseIntPipe) id: number) {
    return res.sendFile(image, { root: './uploads/profile/' + id });
  }

  @Post('forgot')
  forgotPassword(@Body(ValidationPipe) email: JwtPayload): Promise<{ accessToken: string }> {
    const accessToken = this.authService.forgotPassword(email);
    return accessToken;
  }

  @Put('profile/reset/password')
  @UseGuards(AuthGuard())
  resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto, @GetUser() user: User): Promise<User> {
    return this.authService.resetPassword(user, resetPasswordDto);
  }
}
