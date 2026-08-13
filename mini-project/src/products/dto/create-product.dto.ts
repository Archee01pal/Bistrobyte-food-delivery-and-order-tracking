import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Product description is required' })
  description: string;

  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;
}