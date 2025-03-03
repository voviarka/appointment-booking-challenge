import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { GlobalExceptionFilter } from './global-exception.filter';

const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

type MockResponse = {
  status: jest.Mock;
  send: jest.Mock;
};

type TestContext = {
  filter: GlobalExceptionFilter;
  host: ArgumentsHost;
  response: MockResponse;
  request: Pick<FastifyRequest, 'url' | 'method'>;
  loggerSpy: jest.SpyInstance;
};

const createTestContext = (): TestContext => {
  const response: MockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  const request = { url: '/test-path', method: 'GET' };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response as unknown as FastifyReply,
      getRequest: () => request,
    }),
  } as ArgumentsHost;

  const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

  return {
    filter: new GlobalExceptionFilter(),
    host,
    response,
    request,
    loggerSpy,
  };
};

describe('GlobalExceptionFilter', () => {
  let context: TestContext;

  beforeEach(() => {
    context = createTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when handling HTTP exceptions', () => {
    it('should handle basic HttpException with string message and log error', () => {
      const exception = new HttpException(
        'Error message',
        HttpStatus.BAD_REQUEST,
      );

      context.filter.catch(exception, context.host);

      expect(context.response.status).toHaveBeenCalledWith(
        HttpStatus.BAD_REQUEST,
      );
      expect(context.response.send).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error message',
        timestamp: expect.stringMatching(ISO_8601_REGEX) as string,
        path: '/test-path',
      } as ErrorResponse);
      expect(context.loggerSpy).toHaveBeenCalledWith(
        '400 GET /test-path',
        exception.stack,
        'GlobalExceptionFilter',
      );
    });

    it('should handle HttpException with object response and log error', () => {
      const exception = new HttpException(
        { message: 'Structured error' },
        HttpStatus.BAD_REQUEST,
      );

      context.filter.catch(exception, context.host);

      expect(context.response.status).toHaveBeenCalledWith(
        HttpStatus.BAD_REQUEST,
      );
      expect(context.response.send).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Structured error',
        timestamp: expect.stringMatching(ISO_8601_REGEX) as string,
        path: '/test-path',
      } as ErrorResponse);
      expect(context.loggerSpy).toHaveBeenCalledWith(
        '400 GET /test-path',
        exception.stack,
        'GlobalExceptionFilter',
      );
    });
  });

  describe('when handling generic errors', () => {
    it('should handle general Error with default message and log error', () => {
      const exception = new Error('Unexpected error');

      context.filter.catch(exception, context.host);

      expect(context.response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(context.response.send).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp: expect.stringMatching(ISO_8601_REGEX) as string,
        path: '/test-path',
      } as ErrorResponse);
      expect(context.loggerSpy).toHaveBeenCalledWith(
        '500 GET /test-path',
        exception.stack,
        'GlobalExceptionFilter',
      );
    });
  });
});
