import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email' | 'nickname'> | null;
    }
  }
}

declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      email: string;
      nickname: string;
      password?: string;
      image?: string | null;
    } | null;
  }
}


export {};
