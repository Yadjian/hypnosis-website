import { Controller, Post, Body, Get, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { Response } from 'express';
import { Res } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
  /**
   * POST /auth/register
   * Register a new user account
   * Body: { email, pseudo, password, passwordConfirm }
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  /**
   * POST /auth/login
   * Authenticate user with email or pseudo + password
   * Body: { identifier, password }
   * Returns: { access_token }
   * Sets: refresh_token cookie (httpOnly)
   */
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(loginUserDto);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: tokens.access_token,
    };
  }

  /**
   * GET /auth/me
   * Get authenticated user profile
   * Requires: JWT token (Authorization header)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return {
      id: req.user.userId,
      email: req.user.email,
      pseudo: req.user.pseudo,
      message: 'Profil récupéré avec succès'
    };
  }

  /**
   * PATCH /auth/profile
   * Update user profile (email, pseudo, password)
   * Requires: JWT token + currentPassword verification
   * Body: { currentPassword, email?, pseudo?, password?, passwordConfirm? }
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return await this.authService.updateProfile(req.user.userId, updateProfileDto);
  }

  /**
   * DELETE /auth/account
   * Delete user account permanently
   * Requires: JWT token
   * Warning: Deletes all user data (appointments, reviews, payments)
   */
  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Request() req: any) {
    return await this.authService.deleteAccount(req.user.userId);
  }
}