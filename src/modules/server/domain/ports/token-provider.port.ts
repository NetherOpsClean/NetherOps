export const TOKEN_PROVIDER = Symbol("TOKEN_PROVIDER");
export interface JwtPayLoad {
  sub: string;
  role: string;
}

export interface TokenProviderPort {
  generateToken(payload: JwtPayLoad): Promise<string>;
}
