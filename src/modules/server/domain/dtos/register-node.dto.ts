export class RegisterNodeDto {
  alias: string;
  ipAddress: string;
  memoryCapacityMb: number;
  portRangeStart: number;
  portRangeEnd: number;
  totalDiskMb: number;

  constructor(
    alias: string,
    ipAddress: string,
    memoryCapacityMb: number,
    portRangeStart: number,
    portRangeEnd: number,
    totalDiskMb: number
  ) {
    this.alias = alias;
    this.ipAddress = ipAddress;
    this.memoryCapacityMb = memoryCapacityMb;
    this.portRangeStart = portRangeStart;
    this.portRangeEnd = portRangeEnd;
    this.totalDiskMb = totalDiskMb;
  }
}
