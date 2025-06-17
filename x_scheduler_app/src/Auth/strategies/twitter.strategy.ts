// src/auth/strategies/twitter.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
 constructor(private configService: ConfigService) {
  super({
    consumerKey: configService.get<string>('TWITTER_CONSUMER_KEY')!,
    consumerSecret: configService.get<string>('TWITTER_CONSUMER_SECRET')!,
    callbackURL: configService.get<string>('TWITTER_CALLBACK_URL')!,
    includeEmail: true,
  });
}

  async validate(
    token: string,
    tokenSecret: string,
    profile: any,
    done: Function,
  ) {
    const user = {
      twitterId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profileImageUrl: profile.photos?.[0]?.value || null,
      accessToken: token,
      tokenSecret: tokenSecret,
    };

    done(null, user);
  }
}
