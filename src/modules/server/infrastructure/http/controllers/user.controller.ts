// src/modules/users/infrastructure/controllers/user.controller.ts
import { Controller, Post, Body, Res, HttpStatus, Get } from "@nestjs/common";
import { type Response } from "express";
import { CreateUserUseCase } from "../../../application/use-cases/create-user.use-case";
import { type CreateUserDto } from "../../../application/dtos/create-user.dto";
import { GetAllUsersUseCase } from "../../../application/use-cases/get-all-users.use-case";

@Controller("users") // Esto define la ruta base: /users
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase
  ) {}

  @Post() // POST /users
  async create(@Body() dto: CreateUserDto, @Res() res: Response): Promise<Response> {
    const result = await this.createUserUseCase.execute(dto);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Get() // GET /users
  async findAll(@Res() res: Response): Promise<Response> {
    const result = await this.getAllUsersUseCase.execute();
    return res.status(HttpStatus.OK).json(result);
  }
}
