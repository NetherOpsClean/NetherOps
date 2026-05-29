import { Injectable, Logger, InternalServerErrorException } from "@nestjs/common";
import Dockerode from "dockerode";
import {
  ContainerConfig,
  ContainerInfo,
  ContainerProvider,
} from "../../domain/ports/container.provider.js";
import { ConfigService } from "@nestjs/config";
import { Readable } from "node:stream";

@Injectable()
export class DockerContainerProvider implements ContainerProvider {
  private readonly docker: Dockerode;
  private readonly logger = new Logger(DockerContainerProvider.name);

  constructor(private configService: ConfigService) {
    const dockerHost = this.configService.get<string>("DOCKER_SOCKET_PATH");

    this.docker = new Dockerode(dockerHost ? { host: dockerHost } : undefined);
  }

  private async ensureImage(image: string): Promise<void> {
    try {
      await this.docker.getImage(image).inspect();
    } catch {
      this.logger.log(`Pulling image ${image}...`);
      await new Promise<void>((resolve, reject) => {
        void this.docker.pull(image, (err: Error, stream: NodeJS.ReadableStream) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, (err: Error | null) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
      this.logger.log(`Image ${image} ready`);
    }
  }

  async create(config: ContainerConfig): Promise<string> {
    this.logger.log(`Creating container for server ${config.serverId}`);

    await this.ensureImage(config.image);
    const memoryBytes = config.memoryMb * 1024 * 1024;
    const containerName = config.serverId;

    try {
      const container = await this.docker.createContainer({
        name: containerName,
        Image: config.image,
        Env: [
          "EULA=TRUE",
          `VERSION=LATEST`,
          `MEMORY=${config.memoryMb}M`,
          `SERVER_NAME=${config.name}`,
          `ONLINE_MODE=${!config.cracked}`,
          `MODE=${config.gameMode.toLowerCase()}`,
          `DIFFICULTY=${config.difficulty.toLowerCase()}`,
          `MOTD=${config.motd}`,
          `MAX_PLAYERS=${config.maxPlayers}`,
          `PVP=${config.pvpEnabled}`,
          `ONLINE_MODE=${!config.cracked}`,
          `TYPE=VANILLA`,
        ],
        ExposedPorts: {
          "25565/tcp": {},
          "25565/udp": {},
        },
        HostConfig: {
          Memory: memoryBytes,
          MemoryReservation: Math.floor(memoryBytes * 0.8),
          CpuCount: 2,
          PortBindings: {
            "25565/tcp": [{ HostPort: String(config.port) }],
            "25565/udp": [{ HostPort: String(config.port) }],
          },
          Binds: [`/mc-servers/${config.serverId}/data:/data`],
          RestartPolicy: { Name: "no" },
        },
        Labels: {
          "mc.server-id": config.serverId,
          "mc.managed-by": "netherops",
        },
      });

      return container.id;
    } catch (err) {
      this.logger.error(`Failed to create container for ${config.serverId}`, err);
      throw new InternalServerErrorException("Could not create server container");
    }
  }

  async start(containerId: string): Promise<void> {
    this.logger.log(`Starting container ${containerId}`);
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
    } catch (err) {
      this.logger.error(`Failed to start container ${containerId}`, err);
      throw new InternalServerErrorException("Could not start server container");
    }
  }

  async stop(containerId: string): Promise<void> {
    this.logger.log(`Stopping container ${containerId}`);
    try {
      const container = this.docker.getContainer(containerId);
      // t: segundos de espera antes de SIGKILL — da tiempo al mundo de guardarse
      await container.stop({ t: 20 });
    } catch (err: unknown) {
      // 304 = container already stopped, no es un error real
      if ((err as { statusCode?: number }).statusCode === 304) return;
      this.logger.error(`Failed to stop container ${containerId}`, err);
      throw new InternalServerErrorException("Could not stop server container");
    }
  }

  async remove(containerId: string): Promise<void> {
    this.logger.log(`Removing container ${containerId}`);
    try {
      const container = this.docker.getContainer(containerId);
      await container.remove({ force: false, v: false });
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return;
      this.logger.error(`Failed to remove container ${containerId}`, err);
      throw new InternalServerErrorException("Could not remove server container");
    }
  }

  async getInfo(containerId: string): Promise<ContainerInfo> {
    try {
      const container = this.docker.getContainer(containerId);
      const inspection = await container.inspect();

      const state = inspection.State;
      let status: ContainerInfo["status"];

      if (state.Running) {
        status = "running";
      } else if (state.Dead || state.OOMKilled) {
        status = "error";
      } else {
        status = "stopped";
      }

      return { containerId, status };
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) {
        return { containerId, status: "stopped" };
      }
      throw new InternalServerErrorException("Could not inspect container");
    }
  }

  async executeCommand(containerId: string, command: string): Promise<void> {
    this.logger.log(`Executing command on ${containerId}: ${command}`);

    try {
      const container = this.docker.getContainer(containerId);

      const exec = await container.exec({
        Cmd: ["rcon-cli", command],
        AttachStdout: true,
        AttachStderr: true,
      });

      await exec.start({ Detach: false });
    } catch (err: unknown) {
      const dockerError = err as { statusCode?: number };

      if (dockerError.statusCode === 409 || dockerError.statusCode === 404) {
        this.logger.warn(`Cannot execute command. Container ${containerId} is not running.`);
        throw new Error("Server is not running");
      }

      this.logger.error(`Failed to execute command on ${containerId}`, err);
      throw new InternalServerErrorException("Could not execute server command");
    }
  }

  async getLogsStream(containerId: string): Promise<Readable> {
    try {
      const container = this.docker.getContainer(containerId);
      const stream = await container.logs({ follow: true, stdout: true, stderr: true, tail: 100 });
      return stream as Readable;
    } catch (error) {
      this.logger.error(`Could not attach to logs of ${containerId}`, error);
      throw new Error("Log stream unavailable");
    }
  }
}
