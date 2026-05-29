import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Readable } from "node:stream";
import type { Server, WebSocket } from "ws";
import { Inject, Logger } from "@nestjs/common";
import {
  CONTAINER_PROVIDER,
  type ContainerProvider,
} from "../../domain/ports/container.provider.js";
import {
  SERVER_REPOSITORY,
  type ServerRepository,
} from "../../domain/repositories/server.repository.js";

@WebSocketGateway({ path: "/console" })
export class ConsoleGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ConsoleGateway.name);
  private activeStreams = new Map<WebSocket, Readable>();

  constructor(
    @Inject(CONTAINER_PROVIDER) private containerProvider: ContainerProvider,
    @Inject(SERVER_REPOSITORY) private serverRepository: ServerRepository
  ) {}

  handleConnection(_client: WebSocket): void {
    this.logger.log("Nuevo cliente WebSocket conectado");
  }

  handleDisconnect(client: WebSocket): void {
    this.logger.log("Cliente desconectado. Limpiando streams...");
    const stream = this.activeStreams.get(client);

    if (stream) {
      stream.destroy();
      this.activeStreams.delete(client);
    }
  }

  @SubscribeMessage("attach")
  async handleAttach(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() payload: { serverId: string; userId: string }
  ): Promise<void> {
    try {
      // const server = await this.serverRepository.findById(...);
      // if (!valid) return client.send(JSON.stringify({ type: 'error', data: 'Unauthorized' }));

      const stream = await this.containerProvider.getLogsStream(payload.serverId);

      this.activeStreams.set(client, stream);

      client.send(
        JSON.stringify({ type: "info", data: "Conectado a la consola del servidor...\n" })
      );

      stream.on("data", (chunk: Buffer) => {
        const cleanChunk = chunk.length > 8 ? chunk.subarray(8) : chunk;
        const logLine = cleanChunk.toString("utf-8");

        client.send(JSON.stringify({ type: "log", data: logLine }));
      });

      stream.on("end", () => {
        client.send(JSON.stringify({ type: "info", data: "\n[Proceso del servidor finalizado]" }));
        this.activeStreams.delete(client);
      });

      stream.on("error", (err) => {
        this.logger.error("Error en el stream de Docker", err);
        client.send(JSON.stringify({ type: "error", data: "Error leyendo logs." }));
      });
    } catch (error) {
      this.logger.error(error);
      client.send(JSON.stringify({ type: "error", data: "No se pudo conectar a la consola." }));
    }
  }
}
