import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { StopServerDto } from "../dtos/stop-server.dto.js";
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
export class StopServerUseCase {
  private readonly logger = new Logger(StopServerUseCase.name);

  constructor(
    @Inject(SERVER_REPOSITORY)
    private serverRepository: ServerRepository,
    @Inject(CONTAINER_PROVIDER)
    private containerProvider: ContainerProvider
  ) {}

  async execute(req: StopServerDto): Promise<void> {
    const serverId = IdFactory.load<ServerId>(req.serverId);

    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new NotFoundException(`Server with ID ${req.serverId} not found`);
    }

    const ownerId = server.getOwnerId();
    const ownerIdValue =
      typeof ownerId === "string" ? ownerId : (ownerId as { value: string }).value;

    if (ownerIdValue !== req.requesterId) {
      throw new UnauthorizedException("You do not have permission to stop this server");
    }

    try {
      server.stop();
    } catch (domainError: unknown) {
      const errorMessage =
        domainError instanceof Error ? domainError.message : "Invalid server state";
      throw new ConflictException(errorMessage);
    }

    const containerIdentifier = req.serverId;
    try {
      await this.containerProvider.stop(containerIdentifier);
    } catch (infraError) {
      this.logger.error(`Failed to stop container ${containerIdentifier}`, infraError);
      throw new InternalServerErrorException("Failed to communicate with container provider");
    }

    server.markAsOffline();

    try {
      await this.serverRepository.save(server);
    } catch (dbError) {
      this.logger.error(
        `CRITICAL: Server ${req.serverId} was stopped but database update failed. State is out of sync.`,
        dbError
      );
      throw new InternalServerErrorException(
        "Container stopped, but failed to update server status in database."
      );
    }
  }
}
