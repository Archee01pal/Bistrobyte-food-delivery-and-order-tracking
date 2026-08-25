import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail(undefined, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password field is required' })
  password: string;
}