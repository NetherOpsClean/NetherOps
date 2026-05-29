export class AddUserToServerDto {
  ownerId: string;
  guestId: string;
  serverId: string;

  constructor(ownerId: string, guestId: string, serverId: string) {
    this.ownerId = ownerId;
    this.guestId = guestId;
    this.serverId = serverId;
  }
}
