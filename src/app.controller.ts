import { Controller, Get, Header, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthcheck')
  @Header('Cache-Control', 'no-cache')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  healthcheck() {
    return 'healthy';
  }
}
