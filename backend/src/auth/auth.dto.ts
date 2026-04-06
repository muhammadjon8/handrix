import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 8, description: 'The secure password for the account' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'client', enum: ['client', 'handyman', 'admin'], required: false })
  @IsOptional()
  @IsString()
  role?: 'client' | 'handyman' | 'admin';

  @ApiProperty({ example: false, required: false, description: 'Directly flag if the user is a handyman' })
  @IsOptional()
  @IsBoolean()
  isHandyman?: boolean;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
