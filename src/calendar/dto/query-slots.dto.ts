import {
  IsArray,
  IsEnum,
  IsString,
  IsNotEmpty,
  ArrayNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsISODate } from '../../common/validators/isISODate';
import { PRODUCTS, RATINGS, LANGUAGES, ERROR_MESSAGES } from '../constants';

import type { Language } from '../types/language.type';
import type { Rating } from '../types/rating.type';
import type { Product } from '../types/product.type';

export class QuerySlotsDto {
  @ApiProperty({
    example: '2024-05-03',
    description: 'Date in YYYY-MM-DD format',
    required: true,
  })
  @IsISODate({ message: ERROR_MESSAGES.DATE_FORMAT })
  @IsNotEmpty({ message: ERROR_MESSAGES.DATE_REQUIRED })
  date: string;

  @ApiProperty({
    example: PRODUCTS,
    isArray: true,
    enum: PRODUCTS,
    description: 'List of products to discuss',
    required: true,
  })
  @IsEnum(PRODUCTS, {
    each: true,
    message: ERROR_MESSAGES.PRODUCTS_ENUM(PRODUCTS),
  })
  @ArrayMaxSize(2, { message: ERROR_MESSAGES.PRODUCTS_MAX })
  @ArrayNotEmpty({ message: ERROR_MESSAGES.PRODUCTS_EMPTY })
  @IsArray({
    message: ERROR_MESSAGES.PRODUCTS_ARRAY,
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.PRODUCTS_REQUIRED })
  products: Product[];

  @ApiProperty({
    example: 'German',
    enum: LANGUAGES,
    description: ERROR_MESSAGES.LANGUAGE_REQUIRED,
    required: true,
  })
  @IsString({ message: ERROR_MESSAGES.LANGUAGE_REQUIRED })
  @IsEnum(LANGUAGES, {
    message: ERROR_MESSAGES.LANGUAGE_ENUM(LANGUAGES),
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.LANGUAGE_REQUIRED })
  language: Language;

  @ApiProperty({
    example: 'Gold',
    enum: RATINGS,
    description: 'Customer rating',
    required: true,
  })
  @IsEnum(RATINGS, {
    message: ERROR_MESSAGES.RATING_ENUM(RATINGS),
  })
  @IsString()
  @IsNotEmpty({ message: ERROR_MESSAGES.RATING_REQUIRED })
  rating: Rating;
}
