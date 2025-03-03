import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SlotBookingsDto {
  @ApiProperty({
    example: [2, 5],
    description: 'Slot ids',
    required: true,
  })
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  @IsArray()
  @IsNotEmpty()
  slotIds: number[];

  @ApiProperty({
    example: 2,
    description: 'User id',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
