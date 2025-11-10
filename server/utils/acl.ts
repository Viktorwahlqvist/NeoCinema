import { Request, Response, NextFunction } from "express";
import "express-session"; 

// knows rolles in the system
const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

// this is the middleware function to protect routes based on user roles
export const requireRole = (
  allowedRoles: Array<typeof ROLES[keyof typeof ROLES]>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    if (!req.session.user) {
      return res.status(401).json({ error: "Ej autentiserad" });
    }

    // check user role
    const userRole = req.session.user.role; 
    if (!allowedRoles.includes(userRole)) {
      // they are logged in but do not have the right role
      return res
        .status(403)
        .json({ error: "Åtkomst nekad: Otillräckliga rättigheter" });
    }

    next();
  };
};

// exporting Roles so they can be used elsewhere
export { ROLES };