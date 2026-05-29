import { Controller, Post, Patch, Param, Body, Res, HttpStatus, Get } from "@nestjs/common";
import { type Response } from "express";
import { RegisterNodeUseCase } from "../../domain/use-cases/register-node.use-case.js";
import { DisableNodeUseCase } from "../../domain/use-cases/disable-node.use-case.js";
import { RegisterNodeDto } from "../../domain/dtos/register-node.dto.js";
import { GetAllNodesUseCase } from "../../domain/use-cases/get-all-nodes.use.case.js";
import { Node } from "../../domain/entities/node.entity.js";

@Controller("nodes")
export class NodeController {
  constructor(
    private readonly registerNodeUseCase: RegisterNodeUseCase,
    private readonly disableNodeUseCase: DisableNodeUseCase,
    private readonly getAllNodesUseCase: GetAllNodesUseCase
  ) {}

  @Post()
  async register(@Body() dto: RegisterNodeDto, @Res() res: Response): Promise<Response> {
    const node: Node = await this.registerNodeUseCase.execute({
      alias: dto.alias,
      ipAddress: dto.ipAddress,
      memoryCapacityMb: dto.memoryCapacityMb,
      portRangeStart: dto.portRangeStart,
      portRangeEnd: dto.portRangeEnd,
    });

    return res.status(HttpStatus.CREATED).json({
      id: node.getId().toString(),
      alias: node.getAlias(),
      ipAddress: node.getIpAddress(),
      memoryCapacityMb: node.getMemoryCapacityMb(),
      portRange: node.getPortRange().getValue(),
      status: node.isDisabled() ? "DISABLED" : "ACTIVE",
    });
  }

  @Patch(":id/disable")
  async disable(@Param("id") id: string, @Res() res: Response): Promise<Response> {
    await this.disableNodeUseCase.execute({
      nodeId: id,
      requesterId: "admin", // reemplazar por JWT cuando tengas auth
    });

    return res.status(HttpStatus.OK).json({ message: "Node disabled successfully" });
  }

  @Get()
  async list(@Res() res: Response): Promise<Response> {
    const nodes = await this.getAllNodesUseCase.execute();
    return res.status(HttpStatus.OK).json({ message: "List of nodes", nodes });
  }
}
