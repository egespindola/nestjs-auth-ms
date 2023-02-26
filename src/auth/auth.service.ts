import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from './../users/users.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { PrismaService } from './../prisma/prisma.service';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { identity } from 'rxjs';

@Injectable()
export class AuthService {
  private audience = 'users';
  private issuer = 'login';
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly mailer: MailerService,
  ) {}

  createToken(user: User) {
    return {
      token: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7 days',
          subject: String(user.id),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }

  checkToken(token) {
    // console.log(process.env);
    try {
      return this.jwtService.verify(token, {
        issuer: this.issuer,
        audience: this.audience,
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  isValidToken(token) {
    try {
      console.log('token');
      console.log(token);
      this.checkToken(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  async login(email: string, password: string): Promise<any> {
    const responseUser = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!(await bcrypt.compare(password, responseUser.password)))
      throw new UnauthorizedException('User and/or password incorrect!');

    return this.createToken(responseUser);
  }

  async forget(email: string): Promise<boolean> {
    const responseUser = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!responseUser)
      throw new UnauthorizedException('User password incorrect!');

    const token = this.jwtService.sign(
      {
        id: responseUser.id,
      },
      {
        expiresIn: '30 minutes',
        subject: 'Recover your password',
        issuer: 'Forget',
        audience: 'users',
      },
    );

    await this.mailer.sendMail({
      subject: 'Password Recovery',
      to: 'john.doe@somber.ru',
      template: 'forget',
      context: {
        name: responseUser.name,
        token,
      },
    });

    return true;
  }

  async reset(password: string, token: string): Promise<any> {
    // TODO: validate token
    // TODO: extract id from token
    try {
      const data = this.jwtService.verify(token, {
        issuer: 'Forget',
        audience: 'users',
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException('Token is invalid');
      }

      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(password, salt);

      const responseUser = await this.prisma.user.update({
        where: {
          id: Number(data.id),
        },
        data: {
          password,
        },
      });

      return this.createToken(responseUser);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.usersService.create(data);

    return this.createToken(user);
  }
}
