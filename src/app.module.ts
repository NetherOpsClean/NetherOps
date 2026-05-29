import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./modules/shared/infrastructure/database/prisma/prisma.module.js";
import { NodeModule } from "./modules/server/node.module.js";
import { ServerModule } from "./modules/server/server.module.js";
import { AuthModule } from "./modules/server/auth.module.js";
import { TemplateModule } from "./modules/server/template.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
    }),
    PrismaModule,
    NodeModule,
    ServerModule,
    AuthModule,
    TemplateModule,
  ],
  providers: [],
})
export class AppModule {}
