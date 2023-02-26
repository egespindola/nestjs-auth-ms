import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthForgetDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
