import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotDto {
  @ApiProperty({
    example: [3, 4],
    description: 'IDs of available slots',
  })
  slot_ids: number[];

  @ApiProperty({
    example: 2,
    description: 'Number of available slots at this time',
  })
  available_count: number;

  @ApiProperty({
    example: '2024-05-03T10:30:00.000Z',
    description: 'Start time of the slot',
  })
  start_date: string;
}
