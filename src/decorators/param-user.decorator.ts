import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const user = context.switchToHttp().getRequest().user;
    console.log('filter');
    console.log(filter);
    if (user) {
      return user[filter];
    } else {
      return {
        error: 'User not found. Try using AuthGuard in this request',
      };
    }
  },
);
