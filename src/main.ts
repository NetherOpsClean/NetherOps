import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { WsAdapter } from "@nestjs/platform-ws";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  app.setGlobalPrefix("api");

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
