import { EntityRepository, Repository } from 'typeorm';
import { Option } from './entities/options.entity';

@EntityRepository(Option)
export class OptionRepository extends Repository<Option> {}
