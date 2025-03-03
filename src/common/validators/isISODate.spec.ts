import { IsISODate } from './isISODate';
import { validate } from 'class-validator';

// Test class to validate the decorator
class TestModel {
  @IsISODate()
  date: string;

  constructor(date: string) {
    this.date = date;
  }
}

describe('IsISODate', () => {
  it('should pass for valid ISO dates', async () => {
    const testCases = [
      '2024-03-15',
      '2024-12-31',
      '2024-01-01',
      '2000-02-29', // leap year
    ];

    for (const date of testCases) {
      const model = new TestModel(date);
      const errors = await validate(model);

      expect(errors).toHaveLength(0);
    }
  });

  it('should fail for invalid ISO dates', async () => {
    const testCases = [
      '2024-13-01', // invalid month
      '2024-00-01', // invalid month
      '2024-01-32', // invalid day
      '2024-01-00', // invalid day
      '2023-02-29', // non-leap year February 29
      '2024/03/15', // wrong format
      '15-03-2024', // wrong format
      'invalid', // completely invalid
      '', // empty string
    ];

    for (const date of testCases) {
      const model = new TestModel(date);
      const errors = await validate(model);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isISODate).toBe(
        'Date must be a valid ISO date in YYYY-MM-DD format',
      );
    }
  });

  it('should handle undefined and null values', async () => {
    const testCases = [undefined, null];

    for (const date of testCases) {
      const model = new TestModel(date as any);
      const errors = await validate(model);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isISODate).toBe(
        'Date must be a valid ISO date in YYYY-MM-DD format',
      );
    }
  });
});
