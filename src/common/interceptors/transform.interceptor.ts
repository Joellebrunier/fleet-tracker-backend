import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '@common/dto/api-response.dto';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If already wrapped in ApiResponseDto, return as-is
        if (data instanceof ApiResponseDto) {
          return data;
        }

        // Wrap response
        return ApiResponseDto.success(data, 'Success');
      }),
    );
  }
}
