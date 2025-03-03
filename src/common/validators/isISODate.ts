import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return dateString === date.toISOString().split('T')[0];
}

@ValidatorConstraint({ name: 'isISODate', async: false })
class IsISODateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string) {
    return (
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(dateString) &&
      isValidDate(dateString)
    );
  }

  defaultMessage() {
    return 'Date must be a valid ISO date in YYYY-MM-DD format';
  }
}

export function IsISODate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsISODateConstraint,
    });
  };
}
