import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { AuthSignUpDto } from './dto/auth-signUp.dto';
import { EditUserDto } from './dto/editUser.dto';
import { EditPasswordDto } from './dto/editPassword.dto.';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from './user-role.enum';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authSignUpDto: AuthSignUpDto): Promise<void> {
    const { email, password, firstname, lastname, birthDate } = authSignUpDto;

    const user = new User();
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.firstname = firstname;
    user.lastname = lastname;
    user.birthDate = birthDate;
    user.role = UserRole.USER;

    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Cet email existe déjà.');
      } else {
        throw new InternalServerErrorException('Une erreur est survenue.');
      }
    }
  }

  async editUser(editUserDto: EditUserDto, user: User): Promise<User> {
    const { firstname, lastname, birthDate } = editUserDto;
    const editedUser = await this.findOne({ id: user.id });
    editedUser.firstname = firstname;
    editedUser.lastname = lastname;
    editedUser.birthDate = birthDate;

    await editedUser.save();
    return editedUser;
  }

  async editUserRole(userId: number, role: string): Promise<User> {
    const editedUser = await this.findOne({ id: userId });

    switch (role) {
      case 'USER':
        editedUser.role = UserRole.USER;
        break;
      case 'ADMIN':
        editedUser.role = UserRole.ADMIN;
        break;
      case 'SUPERADMIN':
        editedUser.role = UserRole.SUPERADMIN;
        break;
      default:
        editedUser.role = UserRole.USER;
        break;
    }

    await editedUser.save();
    return editedUser;
  }

  async editPassword(editPasswordDto: EditPasswordDto, user: User): Promise<User> {
    const { oldPassword, password } = editPasswordDto;
    if (await user.validatePassword(oldPassword)) {
      const editedUser = await this.findOne({ id: user.id });
      editedUser.salt = await bcrypt.genSalt();
      editedUser.password = await this.hashPassword(password, editedUser.salt);
      await editedUser.save();
      return editedUser;
    } else {
      throw new InternalServerErrorException("Le mot de passe initial n'est pas valide.");
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, user: User): Promise<User> {
    const { password } = resetPasswordDto;
    const editedUser = await this.findOne({ id: user.id });
    editedUser.salt = await bcrypt.genSalt();
    editedUser.password = await this.hashPassword(password, editedUser.salt);
    await editedUser.save();
    return editedUser;
  }

  async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { email, password } = authCredentialsDto;
    const user = await this.findOne({ email });
    if (user && (await user.validatePassword(password))) {
      return user;
    } else {
      return null;
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
