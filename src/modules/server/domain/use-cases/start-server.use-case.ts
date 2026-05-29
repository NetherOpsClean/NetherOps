import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { StartServerDto } from "../dtos/start-server.dto.js";
import {
  SERVER_REPOSITORY,
  type ServerRepository,
} from "../../domain/repositories/server.repository.js";
import {
  CONTAINER_PROVIDER,
  type ContainerProvider,
} from "../../domain/ports/container.provider.js";
import { IdFactory, ServerId } from "../value-objects/id.vo.js";

@Injectable()
export class StartServerUseCase {
  private readonly logger = new Logger(StartServerUseCase.name);

  constructor(
    @Inject(SERVER_REPOSITORY)
    private serverRepository: ServerRepository,
    @Inject(CONTAINER_PROVIDER)
    private containerProvider: ContainerProvider
  ) {}

  async execute(req: StartServerDto): Promise<void> {
    const serverId = IdFactory.load<ServerId>(req.serverId);

    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new NotFoundException(`Server with ID ${req.serverId} not found`);
    }

    const ownerId = server.getOwnerId();
    const ownerIdValue =
      typeof ownerId === "string" ? ownerId : (ownerId as { value: string }).value;

    if (ownerIdValue !== req.requesterId) {
      throw new UnauthorizedException("You do not have permission to start this server");
    }

    try {
      server.start();
    } catch (domainError: unknown) {
      const errorMessage =
        domainError instanceof Error ? domainError.message : "Invalid server state";
      throw new ConflictException(errorMessage);
    }

    const containerIdentifier = req.serverId;
    await this.containerProvider.start(containerIdentifier);

    server.markAsRunning();

    try {
      await this.serverRepository.save(server);
    } catch (dbError) {
      this.logger.error(
        `Database failed when saving server ${req.serverId} as RUNNING. Initiating compensation.`,
        dbError
      );

      try {
        await this.containerProvider.stop(containerIdentifier);
        this.logger.log(`Compensation successful: Container ${containerIdentifier} stopped.`);
      } catch (stopError) {
        this.logger.error(
          `CRITICAL: Compensation failed for container ${containerIdentifier}. Orphan process may exist.`,
          stopError
        );
      }

      throw new InternalServerErrorException(
        "Failed to update server status in database. Container startup was aborted."
      );
    }
  }
}
