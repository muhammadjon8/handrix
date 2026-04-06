import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { db } from '../db';
import { users, handymen } from '../db/schema';
import { eq } from 'drizzle-orm';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role, isHandyman } = registerDto;

    // 1. Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash password using Argon2id
    const passwordHash = await argon2.hash(password);

    // 3. Create user record
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      role: role || 'client',
    }).returning();

    // 4. If handyman role, create a pending handyman profile
    if (isHandyman || role === 'handyman') {
      await db.insert(handymen).values({
        userId: newUser.id,
        status: 'pending',
        availability: 'offline',
      });
    }

    return this.generateTokens(newUser);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password with Argon2
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    };
  }
}
