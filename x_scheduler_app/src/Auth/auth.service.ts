//Twitter se token lena, user ko database mein save karna, JWT banana
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  getTwitterAuthUrl() {
    const { codeVerifier, codeChallenge } = this.generatePKCE();
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', this.configService.get<string>('TWITTER_CLIENT_ID')!);
    authUrl.searchParams.set('redirect_uri', this.configService.get<string>('TWITTER_CALLBACK_URL')!);
    authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    return { authUrl: authUrl.toString(), codeVerifier, state };
  }

  async exchangeCodeForToken(code: string, codeVerifier: string) {
    try {
      const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
      const clientId = this.configService.get<string>('TWITTER_CLIENT_ID')!;
      const clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET')!;
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.configService.get<string>('TWITTER_CALLBACK_URL')!,
        code_verifier: codeVerifier,
        client_id: clientId,
      });
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const { data } = await firstValueFrom(
        this.httpService.post(tokenUrl, body.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
          },
        }),
      );
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data);
      throw new HttpException(
        `Failed to exchange code for token: ${error.response?.data?.error_description || error.response?.data?.detail || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTwitterUser(accessToken: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }),
      );
      return data.data;
    } catch (error) {
      console.error('Error getting Twitter user:', error.response?.data);
      throw new HttpException(
        `Failed to get user info: ${error.response?.data?.detail || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  async findOrCreateUser(twitterProfile: any, tokens: any): Promise<UserDocument> {
    const { id, name, username, profile_image_url } = twitterProfile;
    const { accessToken, refreshToken, expiresIn } = tokens;
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));
    let user = await this.userModel.findOne({ twitterId: id });
    if (user) {
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.tokenExpiresAt = expiresAt;
      user.displayName = name;
      user.username = username;
      user.profileImageUrl = profile_image_url;
    } else {
      user = new this.userModel({
        twitterId: id,
        username: username,
        displayName: name,
        profileImageUrl: profile_image_url,
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpiresAt: expiresAt,
      });
    }
    console.log(`Attempting to save user '${user.username}' to the database...`);
    return user.save();
  }
  
  async refreshAccessToken(refreshToken: string) {
    try {
      const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
      const clientId = this.configService.get<string>('TWITTER_CLIENT_ID')!;
      const clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET')!;
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      });
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const { data } = await firstValueFrom(
        this.httpService.post(tokenUrl, body.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
          },
        }),
      );
      console.log('Access token refreshed successfully:', data);
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data);
      throw new HttpException(
        `Failed to refresh token: ${error.response?.data?.error_description || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  generateJWT(payload: any) {
    return this.jwtService.sign(payload);
  }
}