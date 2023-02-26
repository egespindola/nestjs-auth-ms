import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { AuthResetDTO } from './dto/auth-reset.dto';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthLoginDTO } from './dto/auth-login.dto';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { AuthGuards } from 'src/guards/auth.guards';
import { User } from 'src/decorators/param-user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDTO) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async reset(@Body() { password, token }: AuthResetDTO) {
    return this.authService.reset(password, token);
  }

  @UseGuards(AuthGuards)
  @Post('me')
  async me(@User('email') user) {
    // it receives a string 'bearer + token', if empty, not split to avoid internal error
    // return token.split(' ')[1];
    return {
      me: user,
    };
  }

  @UseGuards(AuthGuards)
  @Post('my-roles')
  async myRoles(@User('role') user) {
    return {
      Role: user,
    };
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuards)
  @Post('upload-file')
  async uploadFile(
    @User('id') user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 1024 * (1024 * 6) }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log('UPLOADING ');
    console.log('userid: ', user);
    const result = await writeFile(
      join(__dirname, '..', '..', 'storage', 'photos', `photo-${user}.png`),
      file.buffer,
    );
    return { success: true };
  }
}
