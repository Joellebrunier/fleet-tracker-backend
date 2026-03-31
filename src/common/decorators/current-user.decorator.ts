import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '@common/interfaces/user-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    if (!data) {
      return request.user;
    }
    return request.user?.[data];
  },
);
