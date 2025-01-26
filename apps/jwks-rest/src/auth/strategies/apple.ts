import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { passportJwtSecret } from "jwks-rsa";

import { UserService } from "../../user/user.service";
import { UserEntity } from "../../user/user.entity";

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, "apple") {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://appleid.apple.com/auth/keys",
      }),
      issuer: "https://appleid.apple.com",
      algorithms: ["RS256"],
    });
  }

  public async validate(payload: { email: string }): Promise<UserEntity> {
    const userEntity = await this.userService.findOne({ email: payload.email });

    if (!userEntity) {
      throw new UnauthorizedException();
    }

    return userEntity;
  }
}
