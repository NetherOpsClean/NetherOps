import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenProviderPort, JwtPayLoad } from "../../domain/ports/token-provider.port.js";

@Injectable()
export class JwtTokenProvider implements TokenProviderPort {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: JwtPayLoad): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
