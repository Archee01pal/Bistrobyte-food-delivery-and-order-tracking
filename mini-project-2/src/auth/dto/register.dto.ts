import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be blank' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsIn(['admin', 'user'], { message: 'Role must be either admin or user' })
  role?: 'admin' | 'user' = 'user';
}