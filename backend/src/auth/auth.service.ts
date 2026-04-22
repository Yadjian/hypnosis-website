import { Injectable, ConflictException, BadRequestException, UnauthorizedException  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
 * Generate access and refresh tokens
 * - Access token: short-lived (15 minutes)
 * - Refresh token: long-lived (7 days)
 */
private async getTokens(userId: string, email: string, pseudo: string) {
  const payload = { sub: userId, email, pseudo };

  const accessToken = this.jwtService.sign(payload, {
    expiresIn: '15m',
  });

  const refreshToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
  });

  return {
    accessToken,
    refreshToken,
  };
}

  /**
   * Register a new user
   * - Validates email uniqueness
   * - Validates password confirmation
   * - Hashes password with bcrypt (salt 10)
   * - Returns created user data
   */
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (createUserDto.password !== createUserDto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        pseudo: createUserDto.pseudo,
      },
    });

    return {
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      createdAt: user.createdAt,
    };
  }

  /**
   * Authenticate user by email or pseudo
   * - Finds user by email OR pseudo (identifier field)
   * - Validates password with bcrypt comparison
   * - Generates JWT token on success
   * - Returns access token
   */
  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { 
        OR: [
          { email: loginUserDto.identifier },
          { pseudo: loginUserDto.identifier },
        ]
      },
    });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const tokens = await this.getTokens(user.id, user.email, user.pseudo);

  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  };
}

  /**
   * Update user profile
   * - Requires currentPassword verification (mandatory)
   * - Email and pseudo are checked for uniqueness if modified
   * - Password is optional and hashed if provided
   * - Validates password confirmation if password is changed
   * - Returns updated user data
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Retrieve user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password for security
    const isPasswordValid = await bcrypt.compare(updateProfileDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Validate password/passwordConfirm match if new password is provided
    if (updateProfileDto.password) {
      if (!updateProfileDto.passwordConfirm || updateProfileDto.password !== updateProfileDto.passwordConfirm) {
        throw new BadRequestException('Passwords do not match');
      }
    }

    // Check email uniqueness if modified
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateProfileDto.pseudo && updateProfileDto.pseudo !== user.pseudo) {
      const existingPseudo = await this.prisma.user.findUnique({
        where: { pseudo: updateProfileDto.pseudo },
      });
      if (existingPseudo) {
        throw new ConflictException('Pseudo already exists');
      }
    }

    // Build update data object with modified fields only
    const updateData: any = {};
    if (updateProfileDto.email) updateData.email = updateProfileDto.email;
    if (updateProfileDto.pseudo) updateData.pseudo = updateProfileDto.pseudo;
    if (updateProfileDto.password) {
      updateData.password = await bcrypt.hash(updateProfileDto.password, 10);
    }

    // Update user in database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      pseudo: updatedUser.pseudo,
      message: 'Profile updated successfully',
    };
  }

  /**
   * Delete user account permanently
   * - Deletes all related payments first
   * - Deletes all user appointments
   * - Deletes all user reviews
   * - Finally deletes the user
   * - Returns success message
   */
  async deleteAccount(userId: string) {
    // Delete related payments first (cascade order matters)
    await this.prisma.payment.deleteMany({
      where: {
        appointment: {
          userId: userId,
        },
      },
    });

    await this.prisma.appointment.deleteMany({
      where: { userId: userId },
    });

    await this.prisma.review.deleteMany({
      where: { userId: userId },
    });

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}

