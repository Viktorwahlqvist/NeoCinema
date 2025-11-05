import e from "express";
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      email: string;
    };
  }
}

export {};