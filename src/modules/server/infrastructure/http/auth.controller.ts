import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { CreateUserUseCase } from "../../domain/use-cases/create-user.use-case.js";
import { AuthenticateUserUseCase } from "../../domain/use-cases/authenticate-user.use-case.js";
import { CreateUserDto } from "../../domain/dtos/create-user.dto.js";
import { AuthenticateUserDto } from "../../domain/dtos/authenticate-user.dto.js";
import { type Response } from "express";

@Controller("auth")
export class AuthController {
  private createUserUseCase: CreateUserUseCase;
  private authenticateUserUseCase: AuthenticateUserUseCase;
  constructor(
    createUserUseCase: CreateUserUseCase,
    authenticateUserUseCase: AuthenticateUserUseCase
  ) {
    this.createUserUseCase = createUserUseCase;
    this.authenticateUserUseCase = authenticateUserUseCase;
  }

  @Post("register")
  async register(@Body() dto: CreateUserDto, @Res() res: Response): Promise<Response> {
    try {
      await this.createUserUseCase.execute(dto);
      return res.status(HttpStatus.CREATED).json({ message: "User register successfuly" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }

  @Post("login")
  async login(@Body() dto: AuthenticateUserDto, @Res() res: Response): Promise<Response> {
    try {
      const result = await this.authenticateUserUseCase.execute(dto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: errorMessage });
    }
  }
}
