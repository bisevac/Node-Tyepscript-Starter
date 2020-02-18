export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IAuthPayload {
  id: number;
  email: string;
  name: string;
  surname: string;
  exp?: number;
  iat?: number;
}
