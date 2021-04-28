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
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { PropertyCategoriesValidationPipe } from './pipes/property-categories-validation.pipe';
import { PropertyCategories } from './property-categories.enum';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('properties')
export class PropertiesController {
  private logger = new Logger('PropertiesController');
  constructor(private readonly propertiesService: PropertiesService) {}

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

  // @Put(':id')
  // @UseGuards(AuthGuard())
  // updateProperty(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() createPropertyDto: CreatePropertyDto,
  //   @GetUser() user: User,
  // ): Promise<Property> {
  //   this.logger.verbose(`Data: ${JSON.stringify(createPropertyDto)}`);
  //   return this.propertiesService.updateProperty(+id, createPropertyDto);
  // }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.propertiesService.deleteProperty(+id, user);
  }
}
