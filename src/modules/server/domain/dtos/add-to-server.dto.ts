export class AddUserToServerDto {
  ownerId: string;
  guestEmail: string;
  serverId: string;

  constructor(ownerId: string, guestEmail: string, serverId: string) {
    this.ownerId = ownerId;
    this.guestEmail = guestEmail;
    this.serverId = serverId;
  }
}
