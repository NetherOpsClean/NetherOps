export class ServerResponseDto {
  id: string;
  name: string;
  ownerId: string;

  constructor(id: string, name: string, ownerId: string) {
    this.id = id;
    this.name = name;
    this.ownerId = ownerId;
  }
}
