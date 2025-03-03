import { validate } from 'class-validator';

import { QuerySlotsFactory } from './query-slots.factory';

describe('QuerySlotsDto', () => {
  it('should pass validation with a valid data', async () => {
    const dto = QuerySlotsFactory.createValid();
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe('date', () => {
    it('should return an error message when a string is not a date', async () => {
      const dto = QuerySlotsFactory.createValid({ date: 'invalid-date' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isISODate).toBe(
        'Date must be a valid ISO date in YYYY-MM-DD format',
      );
    });

    it('should return an error message when it is not correct date format', async () => {
      const dto = QuerySlotsFactory.createValid({ date: '2025-02-31' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isISODate).toBe(
        'Date must be a valid ISO date in YYYY-MM-DD format',
      );
    });

    it('should return an error message for the empty date', async () => {
      const dto = QuerySlotsFactory.createValid({ date: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isNotEmpty).toBe('Date is required');
    });
  });

  describe('products', () => {
    it('should return an error message for invalid product', async () => {
      const dto = QuerySlotsFactory.createValid({ products: ['InvalidProduct'] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isEnum).toBe(
        'Products must be either SolarPanels or Heatpumps',
      );
    });

    it('should return an error message for more than 2 products', async () => {
      const dto = QuerySlotsFactory.createValid({
        products: ['SolarPanels', 'Heatpumps', 'InvalidProduct'],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.arrayMaxSize).toBe(
        'No more than 2 products are allowed',
      );
    });

    it('should return an error message if products is not an array', async () => {
      const dto = QuerySlotsFactory.createValid({ products: 'SolarPanels' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isArray).toBe('Products must be an array');
    });

    it('should return an error message for empty products array', async () => {
      const dto = QuerySlotsFactory.createValid({ products: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.arrayNotEmpty).toBe(
        'Products cannot be empty',
      );
    });

    it('should return error message for empty products', async () => {
      const dto = QuerySlotsFactory.createValid({ products: undefined });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isNotEmpty).toBe('Products are required');
    });
  });

  describe('language', () => {
    it('should return an error message for invalid language', async () => {
      const dto = QuerySlotsFactory.createValid({ language: 'InvalidLanguage' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isEnum).toBe(
        'Language must be either German or English',
      );
    });

    it('should return an error message for empty language', async () => {
      const dto = QuerySlotsFactory.createValid({ language: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isNotEmpty).toBe('Language is required');
    });
  });

  describe('rating', () => {
    it('should return an error message for invalid rating', async () => {
      const dto = QuerySlotsFactory.createValid({ rating: 'InvalidRating' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isEnum).toBe(
        'Rating must be Bronze, Silver, Gold',
      );
    });

    it('should return an error message for empty rating', async () => {
      const dto = QuerySlotsFactory.createValid({ rating: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isNotEmpty).toBe('Rating is required');
    });
  });
});
