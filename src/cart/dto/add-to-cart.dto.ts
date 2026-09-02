import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}