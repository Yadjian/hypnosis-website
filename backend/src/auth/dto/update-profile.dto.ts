/**
 * DTO for profile updates
 * All fields except currentPassword are optional
 * Requires password verification for any modification
 */
import { IsOptional, IsString, MinLength, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  /** Current password (required for verification) */
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  /** New email (optional, must be unique if provided) */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** New password (optional, minimum 6 characters) */
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  /** Password confirmation (required if password is provided) */
  @IsOptional()
  @IsString()
  passwordConfirm?: string;

  /** New pseudo/username (optional, minimum 3 characters, must be unique if provided) */
  @IsOptional()
  @IsString()
  @MinLength(3)
  pseudo?: string;
}