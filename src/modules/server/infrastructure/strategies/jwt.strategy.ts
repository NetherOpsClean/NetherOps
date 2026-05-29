import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtPayLoad } from "../../domain/ports/token-provider.port.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || "clave_secreta_de_desarrollo",
    });
  }

  async validate(payload: JwtPayLoad): Promise<{ sub: string; role: string }> {
    return {
      sub: payload.sub,
      role: payload.role,
    };
  }
}
