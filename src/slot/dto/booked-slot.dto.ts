import { ApiProperty } from '@nestjs/swagger';

export class BookedSlotDto {
  @ApiProperty({
    example: 2,
    description: 'Booked slot id',
  })
  id: number;

  @ApiProperty({
    example: 104,
    description: 'Sales manager id',
  })
  sales_manager_id: number;

  @ApiProperty({
    example: '2024-05-03T10:30:00.000Z',
    description: 'Start time of the slot',
  })
  start_date: Date;

  @ApiProperty({
    example: '2024-05-03T10:30:00.000Z',
    description: 'End time of the slot',
  })
  end_date: Date;

  @ApiProperty({
    example: 3,
    description: 'user_id that booked a slot',
  })
  user_id: number;
}
