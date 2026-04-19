/**
 * JWT Strategy (Passport)
 * Validates JWT tokens from Authorization headers
 * Extracts and validates payload on each protected request
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Extract JWT from Authorization header: "Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Do not ignore token expiration
      ignoreExpiration: false,
      // JWT secret for validation
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * Validate JWT payload
   * Called automatically on each protected route
   * Returns user data to be attached to request.user
   */
  validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

