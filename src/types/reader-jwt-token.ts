import { AuthType } from './auth-type';

export type ReaderJwtToken = {
  authType: AuthType;
  hasAccess: boolean;
  readerId: string;
};
