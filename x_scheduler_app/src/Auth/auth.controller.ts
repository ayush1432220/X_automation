///auth/twitter, /auth/callback jaise routes ko handle karta hai
import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Session,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @Get('twitter')
  initiateTwitterAuth(@Session() session: Record<string, any>, @Res() res: Response) {
    const { authUrl, codeVerifier, state } = this.authService.getTwitterAuthUrl();
    
    // Store the verifier and state in the user's session to verify them later.
    session.codeVerifier = codeVerifier;
    session.state = state;
    
    // Redirect the user's browser to the Twitter authorization page.
    return res.redirect(authUrl);
  }

  
  @Get('twitter/callback')
  async handleTwitterCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    if (!state || state !== session.state) {
      throw new HttpException('Invalid state parameter', HttpStatus.BAD_REQUEST);
    }
    
    if (!code) {
      throw new HttpException('Authorization code not provided', HttpStatus.BAD_REQUEST);
    }

    try {
      // Exchange the authorization code for access and refresh tokens.
      const tokens = await this.authService.exchangeCodeForToken(code, session.codeVerifier);
      
      // Use the new access token to get the user's Twitter profile.
      const twitterUser = await this.authService.getTwitterUser(tokens.accessToken);
      
      // Save or update the user in our own database.
      const appUser = await this.authService.findOrCreateUser(twitterUser, tokens);

      // Generate a JWT for our application to secure our own API endpoints.
      const jwt = this.authService.generateJWT({
        userId: appUser._id, // Our internal database ID
        twitterId: twitterUser.id,
        username: twitterUser.username,
      });

      delete session.codeVerifier;
      delete session.state;

    
          return res.redirect(`http://localhost:3001/dashboard/auth?token=${jwt}`);

    } catch (error) {
      throw new HttpException(
        `Authentication failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Refresh token required', HttpStatus.BAD_REQUEST);
    }
    try {
      const tokens = await this.authService.refreshAccessToken(refreshToken);
      return {
        success: true,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Token refresh failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return {
      success: true,
      user: req.user,
      message: 'User information retrieved successfully',
    };
  }
}