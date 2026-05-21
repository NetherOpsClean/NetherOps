// 1. La utilidad para "marcar" los tipos
type Brand<K, T> = K & { readonly __brand: T };

// 2. Declaras todos los IDs de tu sistema en este punto centralizado
export type UserId = Brand<string, "UserId">;
export type ProductId = Brand<string, "ProductId">;
export type OrderId = Brand<string, "OrderId">;
export type ServerId = Brand<string, "ServerId">;
export type OwnerId = Brand<string, "OwnerId">;
export type NodeId = Brand<string, "NodeId">;
export type TemplateId = Brand<string, "TemplateId">;

// 3. El validador y generador central de IDs
export const IdFactory = {
  isValid(id: string): boolean {
    if (!id || id.trim().length === 0) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  /**
   * Genera un nuevo ID seguro y lo "marca" con el tipo correspondiente
   */
  generate<T extends string>(): T {
    return crypto.randomUUID() as unknown as T;
  },

  /**
   * Toma un string (ej. de la Base de Datos o API) y lo transforma al ID marcado si es válido
   */
  load<T extends string>(id: string): T {
    if (!this.isValid(id)) {
      throw new Error(`Invalid ID format: "${id}" is not a valid UUID.`);
    }
    return id as unknown as T;
  },
};
