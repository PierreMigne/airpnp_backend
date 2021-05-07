import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  Logger,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './entities/property.entity';
import { PropertyCategoriesValidationPipe } from './pipes/property-categories-validation.pipe';
import { PropertyCategories } from './property-categories.enum';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PropertyRepository } from './property.repository';
import { Image } from 'src/images/entities/images.entity';
import { existsSync, mkdirSync } from 'fs';

@Controller('properties')
export class PropertiesController {
  private logger = new Logger('PropertiesController');
  constructor(
    private readonly propertiesService: PropertiesService,
    private propertyRepository: PropertyRepository,
  ) {}

  @Get('all')
  getAllProperties(
    @Query(ValidationPipe) filterDto: GetPropertiesFilterDto,
  ): Promise<Property[]> {
    this.logger.verbose(`Filtres: ${JSON.stringify(filterDto)}`);
    return this.propertiesService.getAllProperties(filterDto);
  }

  @Get('all/:id')
  getPropertyById(@Param('id', ParseIntPipe) id: number): Promise<Property> {
    return this.propertiesService.getPropertyById(+id);
  }

  /*
    ALL METHODS WHO SEARCH BY USER
  */

  @Post()
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
    @GetUser() user: User,
  ): Promise<Property> {
    this.logger.verbose(`Data: ${JSON.stringify(createPropertyDto)}`);
    return this.propertiesService.createProperty(createPropertyDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  getPropertiesByUser(@GetUser() user: User): Promise<Property[]> {
    return this.propertiesService.getPropertiesByUser(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  getPropertyByIdAndUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Property> {
    return this.propertiesService.getPropertyByIdAndUser(+id, user);
  }

  @Post(':id/uploads')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const propertiesId = req.params.id;
          const path = `C:/Users/pierr/Desktop/DEV/Nestjs/airpnp/uploads`;
          if (!existsSync(path)) {
            mkdirSync(path);
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
  async addPropertiesFile(
    @GetUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const property = await this.propertyRepository.findOne(
      { id: +id },
      { relations: ['images'] },
    );
    const image = new Image();
    image.property = property;
    image.propertyId = property.id;
    image.file = file.filename;
    property.images.push(image);
    // this.propertiesService.updateProperty(+id, user, property);
    this.propertiesService.savePropertyFile(property);
    return {
      response: 'success',
      image: file.filename,
    };
  }

  // NOT USEFUL FOR NOW. DELETE ?
  @Patch(':id/category')
  @UseGuards(AuthGuard())
  updatePropertyCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body('category', PropertyCategoriesValidationPipe)
    category: PropertyCategories,
    @GetUser() user: User,
  ): Promise<any> {
    return this.propertiesService.updatePropertyCategories(+id, category, user);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  updateProperty(
    @Param('id', ParseIntPipe) id: number,
    @Body() createPropertyDto: CreatePropertyDto,
    @GetUser() user: User,
  ): Promise<Property> {
    this.logger.verbose(`Data: ${JSON.stringify(createPropertyDto)}`);
    return this.propertiesService.updateProperty(+id, user, createPropertyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Property[]> {
    return this.propertiesService.deleteProperty(+id, user);
  }
}
