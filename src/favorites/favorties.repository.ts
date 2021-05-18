import { EntityRepository, Repository } from 'typeorm';
import { Favorite } from './entities/favorites.entity';

@EntityRepository(Favorite)
export class FavoriteRepository extends Repository<Favorite> {}
