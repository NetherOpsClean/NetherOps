import { Controller, Get, Res, HttpStatus } from "@nestjs/common";
import { type Response } from "express";
import { GetAllTemplatesUseCase } from "../../domain/use-cases/get-all-templates.use-case.js";

@Controller("templates")
export class TemplateController {
  constructor(private readonly getAllTemplatesUseCase: GetAllTemplatesUseCase) {}

  @Get()
  async findAll(@Res() res: Response): Promise<Response> {
    const templates = await this.getAllTemplatesUseCase.execute();
    return res.status(HttpStatus.OK).json(templates);
  }
}
