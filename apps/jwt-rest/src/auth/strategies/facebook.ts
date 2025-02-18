import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-facebook";
import { Profile } from "passport";

import { UserEntity } from "../../user/user.entity";
import { UserService } from "../../user/user.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(private readonly userService: UserService) {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      profileFields: ["id", "birthday", "email", "gender", "link", "name", "locale", "picture"],
    });
  }

  authenticate(req: Request, options: Record<string, any> = {}): void {
    super.authenticate(
      req,
      Object.assign(options, {
        scope: ["email"],
      }),
    );
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<UserEntity> {
    if (!profile.emails) {
      throw new UnauthorizedException();
    }

    const userEntity = await this.userService.findOne({ email: profile.emails[0].value });

    if (!userEntity) {
      throw new UnauthorizedException();
    }

    return userEntity;
  }
}
