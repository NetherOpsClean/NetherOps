export class DeleteServerDto {
  id: string;
  requesterId: string;

  constructor(id: string, requesterId: string) {
    this.id = id;
    this.requesterId = requesterId;
  }
}
