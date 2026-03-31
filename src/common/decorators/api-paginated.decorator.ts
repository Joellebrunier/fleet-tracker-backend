import { applyDecorators } from '@nestjs/common';
import { ApiQuery, ApiOkResponse } from '@nestjs/swagger';

export function ApiPaginated(type: any) {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field' }),
    ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' }),
    ApiOkResponse({ type: [type], isArray: true }),
  );
}
