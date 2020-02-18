export class IApplicationConfig {
  [key: string]: any
}

export interface IApplicationConfigManager {
  getDBConfig (): any;
  getServerConfig (): any;
}

export interface IDBOptions {
  [key: string]: any;
}

export interface IJWTConfig {
  secret: string;
  issuer: string;
  audience: string;
  expiresIn: string | number;
}
