import { IsString, IsNotEmpty, IsInt, Min, Max, Length } from 'class-validator';

export class ReviewProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment text cannot be left blank' })
  @Length(3, 500, { message: 'Comment must be between 3 and 500 characters' })
  comment: string;

  @IsInt({ message: 'Rating must be a whole number' })
  @Min(1, { message: 'Minimum review score is 1 star' })
  @Max(5, { message: 'Maximum review score is 5 stars' })
  rating: number;
}