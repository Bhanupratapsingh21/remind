import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error("🔥 [Unhandled Error]:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
