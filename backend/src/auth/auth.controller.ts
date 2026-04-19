import { Controller, Post, Body, Get, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
   */
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
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