import { BadRequestException, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

export class UserIdCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: (error?: any) => void) {
    // console.log('c%middleware: checking. . . ', 'color: red');
    // console.log(req.params.id);

    if (isNaN(Number(req.params.id)) || Number(req.params.id) <= 0) {
      throw new BadRequestException('Invalid ID');
    }
  }
}
