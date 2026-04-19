/**
 * JWT Authentication Guard
 * Protects routes requiring valid JWT token
 * Used with @UseGuards(JwtAuthGuard) on controllers/routes
 */
/**
 * JWT Authentication Guard
 * Protects routes requiring valid JWT token
 * Used with @UseGuards(JwtAuthGuard) on controllers/routes
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}