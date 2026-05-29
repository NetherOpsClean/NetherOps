export const TEMPLATE_REPOSITORY = Symbol("TEMPLATE_REPOSITORY");

export interface TemplateRecord {
  id: string;
  alias: string;
  softwareIdentifier: string;
  startupCommand: string | null;
  createdAt: Date;
}

export interface TemplateRepository {
  findAll(): Promise<TemplateRecord[]>;
  findById(id: string): Promise<TemplateRecord | null>;
}
