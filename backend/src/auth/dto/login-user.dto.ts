/**
 * DTO for user login
 * Supports login by email OR pseudo
 */
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  /** Email or pseudo of the user */
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  /** User password */
  @IsString()
  @IsNotEmpty()
  password!: string;
}