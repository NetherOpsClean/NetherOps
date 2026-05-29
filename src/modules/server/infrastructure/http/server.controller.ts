import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Res,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { type Response } from "express";
import { CreateServerUseCase } from "../../domain/use-cases/create-server.use-case.js";
import { DeleteServerUseCase } from "../../domain/use-cases/delete-server.use-case.js";
import { AddUserToServerUseCase } from "../../domain/use-cases/add-user-to-server.use-case.js";
import { CreateServerDto } from "../../domain/dtos/create-server.dto.js";
import { AddUserToServerDto } from "../../domain/dtos/add-to-server.dto.js";
import { SERVER_ACCESS_REPOSITORY } from "../../domain/repositories/server-access.repository.js";
import type { ServerAccessRepository } from "../../domain/repositories/server-access.repository.js";

@Controller("servers")
export class ServerController {
  constructor(
    private readonly createServerUseCase: CreateServerUseCase,
    private readonly deleteServerUseCase: DeleteServerUseCase,
    private readonly addUserToServerUseCase: AddUserToServerUseCase,
    @Inject(SERVER_ACCESS_REPOSITORY)
    private readonly serverAccessRepository: ServerAccessRepository
  ) {}

  @Post()
  async create(@Body() dto: CreateServerDto, @Res() res: Response): Promise<Response> {
    const server = await this.createServerUseCase.execute(dto);
    return res.status(HttpStatus.CREATED).json(server);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @Res() res: Response): Promise<Response> {
    await this.deleteServerUseCase.execute({
      id,
      requesterId: "user-123", // reemplazar por JWT cuando tengas auth
    });
    return res.status(HttpStatus.OK).json({ message: "Server deleted successfully" });
  }

  @Post(":id/users")
  async addUser(
    @Param("id") serverId: string,
    @Body() body: AddUserToServerDto,
    @Res() res: Response
  ): Promise<Response> {
    const addToServerDto = new AddUserToServerDto(body.ownerId, body.guestId, body.serverId);
    await this.addUserToServerUseCase.execute(addToServerDto);
    return res.status(HttpStatus.CREATED).json({ message: "User added to server successfully" });
  }

  @Get(":id/users")
  async getUsers(@Param("id") serverId: string, @Res() res: Response): Promise<Response> {
    const accesses = await this.serverAccessRepository.findAllByServer(serverId);
    return res.status(HttpStatus.OK).json(
      accesses.map((a) => ({
        userId: a.getUserId(),
        role: a.getRole(),
        createdAt: a.getCreatedAt(),
      }))
    );
  }
}
