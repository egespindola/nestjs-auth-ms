import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from './../prisma/prisma.module';
import { UsersModule } from './../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.APP_JWT_SECRET,
    }),
    PrismaModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
