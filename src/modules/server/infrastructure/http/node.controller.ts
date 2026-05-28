import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Res,
  Req,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";

import { type Response } from "express";

import { RegisterNodeUseCase } from "../../domain/use-cases/register-node.use-case.js";
import { DisableNodeUseCase } from "../../domain/use-cases/disable-node.use-case.js";

import { RegisterNodeDto } from "../../domain/dtos/register-node.dto.js";
import { Node } from "../../domain/entities/node.entity.js";

import { JwtAuthGuard } from "../../../shared/infrastructure/auth/guards/jwt-auth.guard.js";

import { RolesGuard } from "../../../shared/infrastructure/auth/guards/roles.guard.js";

import { Roles } from "../../../shared/infrastructure/auth/decorators/roles.decorator.js";

@Controller("nodes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class NodeController {
  constructor(
    private readonly registerNodeUseCase: RegisterNodeUseCase,
    private readonly disableNodeUseCase: DisableNodeUseCase
  ) {}

  @Post()
  async register(@Body() dto: RegisterNodeDto, @Res() res: Response): Promise<Response> {
    const node: Node = await this.registerNodeUseCase.execute({
      alias: dto.alias,
      ipAddress: dto.ipAddress,
      memoryCapacityMb: dto.memoryCapacityMb,
      totalDiskMb: dto.totalDiskMb,
      portRangeStart: dto.portRangeStart,
      portRangeEnd: dto.portRangeEnd,
    });

    return res.status(HttpStatus.CREATED).json({
      id: node.getId().toString(),
      alias: node.getAlias(),
      ipAddress: node.getIpAddress(),
      memoryCapacityMb: node.getMemoryCapacityMb(),
      totalDiskMb: node.getTotalDiskMb(),
      portRange: node.getPortRange().getValue(),
      status: node.isDisabled() ? "DISABLED" : "ACTIVE",
    });
  }

  @Patch(":id/disable")
  async disable(@Param("id") id: string, @Req() req: any, @Res() res: Response): Promise<Response> {
    await this.disableNodeUseCase.execute({
      nodeId: id,
      requesterId: req.user.id,
    });

    return res.status(HttpStatus.OK).json({ message: "Node disabled successfully" });
  }
}
