import { Injectable, Logger, InternalServerErrorException } from "@nestjs/common";
import Dockerode from "dockerode";
import {
  ContainerConfig,
  ContainerInfo,
  IContainerProvider,
} from "../../application/ports/container.provider";

@Injectable()
export class DockerContainerProvider implements IContainerProvider {
  private readonly docker: Dockerode;
  private readonly logger = new Logger(DockerContainerProvider.name);

  constructor() {
    // Conecta al socket local de Docker.
    // En producción puedes pasar { host, port } para un daemon remoto.
    this.docker = new Dockerode({ socketPath: "/var/run/docker.sock" });
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

    await this.ensureImage("itzg/minecraft-server");
    const memoryBytes = config.memoryMb * 1024 * 1024;
    const containerName = `mc-${config.serverId}`;

    try {
      const container = await this.docker.createContainer({
        name: containerName,
        Image: "itzg/minecraft-server",
        Env: [
          "EULA=TRUE",
          `VERSION=${config.version}`,
          `TYPE=${config.type}`,
          `MEMORY=${config.memoryMb}M`,
          `SERVER_NAME=${config.name}`,
          "ONLINE_MODE=FALSE",
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
          "mc.managed-by": "aternos-clone",
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
      if ((err as { statusCode?: number }).statusCode === 404) return; // Ya no existe, no es un error real
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
}
