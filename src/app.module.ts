import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./modules/server/modules/user.module";
import { ServerModule } from "./modules/server/modules/server.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),
    UserModule,
    ServerModule,
  ],
})
export class AppModule {}
