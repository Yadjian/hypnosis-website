/**
 * Authentication Module
 * Handles user registration, login, profile management, and account deletion
 * Configures JWT authentication with Passport strategy
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule,
    // JWT module with async configuration from ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // JWT secret from environment variables
        secret: configService.get<string>('JWT_SECRET'),
        // Token expiration: 24 hours
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}