import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Profile display name cannot be blank' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters long' })
  name: string;

  @IsString()
  @IsOptional()
  profilePictureBase64?: string; // Optional: contains data:image/png;base64,...
}