import { Module } from "@nestjs/common";

import { JwtModule } from "@nestjs/jwt";

import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";

import { RolesGuard } from "./guards/roles.guard.js";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.APP_SECRET || "CHANGE_ME",

      signOptions: {
        expiresIn: "1h",
      },
    }),
  ],

  providers: [JwtAuthGuard, RolesGuard],

  exports: [JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
