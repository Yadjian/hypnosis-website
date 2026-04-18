import { IsEmail, MinLength, Match } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @Match('password')
    passwordConfirm: string;
}