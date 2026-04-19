/**
 * DTO for user registration
 * Validates: email format, password strength, pseudo format
 */
import { IsEmail, MinLength, IsString } from 'class-validator';

export class CreateUserDto {
  /** User email (must be unique) */
  @IsEmail()
  email!: string;

  /** Password (minimum 6 characters) */
  @MinLength(6)
  password!: string;

  /** Password confirmation (must match password field) */
  @IsString()
  passwordConfirm!: string;

  /** User pseudo/username (must be unique) */
  @IsString()
  pseudo!: string;
}