import { QuerySlotsDto } from './query-slots.dto';
import { PRODUCTS } from '../constants';

export class QuerySlotsFactory {
  static createValid(overrides = {}): QuerySlotsDto {
    const dto = new QuerySlotsDto();
    const validData = {
      date: '2024-05-03',
      products: PRODUCTS,
      language: 'German',
      rating: 'Gold',
    };
    return Object.assign(dto, { ...validData, ...overrides });
  }
}
