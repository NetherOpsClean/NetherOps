import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PasswordHasherPort } from "../../domain/ports/password-hasher.port.js";

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  private readonly saltRounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
