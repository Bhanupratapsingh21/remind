import { Request, Response, NextFunction } from "express";
import { TokenService, TokenPayload } from "../services/token.service";
import prisma from "../config/db";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string | null;
    phone: string | null;
    name: string;
    isOnboarded: boolean;
    plan: string;
    trialEndsAt: Date | null;
    maxReminders: number;
    preferredVoice: string;
    timezone: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Try cookie first, then fallback to Authorization header
    let token = req.cookies?.remind_access_token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. No session token found.",
      });
      return;
    }

    let payload: TokenPayload;

    try {
      payload = TokenService.verifyAccessToken(token);
    } catch {
      res.status(401).json({
        success: false,
        message: "Token expired or invalid",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        name: true,
        isOnboarded: true,
        plan: true,
        trialEndsAt: true,
        maxReminders: true,
        preferredVoice: true,
        timezone: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User session no longer exists",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
