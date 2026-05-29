import { Injectable, Inject } from "@nestjs/common";
import { TEMPLATE_REPOSITORY } from "../../domain/repositories/template.repository.js";
import type {
  TemplateRepository,
  TemplateRecord,
} from "../../domain/repositories/template.repository.js";

@Injectable()
export class GetAllTemplatesUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: TemplateRepository
  ) {}

  async execute(): Promise<TemplateRecord[]> {
    return this.templateRepository.findAll();
  }
}
