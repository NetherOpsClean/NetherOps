export class RegisterNodeDto {
  alias: string;
  ipAddress: string;
  memoryCapacityMb: number;
  portRangeStart: number;
  portRangeEnd: number;

  constructor(
    alias: string,
    ipAddress: string,
    memoryCapacityMb: number,
    portRangeStart: number,
    portRangeEnd: number
  ) {
    this.alias = alias;
    this.ipAddress = ipAddress;
    this.memoryCapacityMb = memoryCapacityMb;
    this.portRangeStart = portRangeStart;
    this.portRangeEnd = portRangeEnd;
  }
}
