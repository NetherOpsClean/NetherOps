import { Controller, Post, Delete, Param, Body, Res, HttpStatus } from "@nestjs/common";
import { type Response } from "express";
import { CreateServerUseCase } from "../../domain/use-cases/create-server.use-case.js";
import { DeleteServerUseCase } from "../../domain/use-cases/delete-server.use-case.js";
import { CreateServerDto } from "../../domain/dtos/create-server.dto.js";

@Controller("servers")
export class ServerController {
  constructor(
    private readonly createServerUseCase: CreateServerUseCase,
    private readonly deleteServerUseCase: DeleteServerUseCase
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
}
