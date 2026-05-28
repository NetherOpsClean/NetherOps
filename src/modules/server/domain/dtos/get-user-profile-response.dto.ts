export interface GetUserProfileResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  quotas: {
    memoryMb: number;
  };
}
