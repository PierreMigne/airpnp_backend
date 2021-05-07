import { EntityRepository, Repository } from 'typeorm';
import { Image } from './entities/images.entity';

@EntityRepository(Image)
export class ImageRepository extends Repository<Image> {}
