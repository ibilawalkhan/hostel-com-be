import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  sub: string; 
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateTokens(user: {
    kuid: string;
    email: string;
  }): Promise<TokenPair> {
    const payload: TokenPayload = {
      sub: user.kuid,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m', 
    });
  }

  private async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d', 
    });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
