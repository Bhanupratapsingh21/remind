import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";
import { ENV } from "../config/env";
import prisma from "../config/db";

export interface TokenPayload {
  userId: string;
  email: string;
  username?: string | null;
  phone?: string | null;
}

export interface EmailVerificationPayload {
  email: string;
  purpose: "email_verification";
}

export class TokenService {
  /**
   * Generates short-lived Access Token (15 minutes)
   */
  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  /**
   * Generates signed Email Verification Token (15 minutes)
   */
  public static generateEmailVerificationToken(email: string): string {
    return jwt.sign({ email, purpose: "email_verification" }, ENV.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  /**
   * Verifies signed Email Verification Token
   */
  public static verifyEmailVerificationToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as EmailVerificationPayload;
      if (decoded.purpose === "email_verification" && decoded.email) {
        return decoded.email;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Verifies Access Token
   */
  public static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  }

  /**
   * Generates long-lived Refresh Token (7 days) and saves to MongoDB
   */
  public static async createRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: rawToken,
        userId,
        expiresAt,
      },
    });

    return rawToken;
  }

  /**
   * Rotates an existing Refresh Token (Single-use rotation pattern)
   */
  public static async rotateRefreshToken(
    oldToken: string
  ): Promise<{ accessToken: string; refreshToken: string; user: any } | null> {
    const existing = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!existing || existing.expiresAt < new Date()) {
      if (existing) {
        await prisma.refreshToken.delete({ where: { id: existing.id } });
      }
      return null;
    }

    // Delete old refresh token to prevent replay
    await prisma.refreshToken.delete({ where: { id: existing.id } });

    // Issue new pair
    const newRefreshToken = await this.createRefreshToken(existing.userId);
    const newAccessToken = this.generateAccessToken({
      userId: existing.user.id,
      email: existing.user.email,
      username: existing.user.username,
      phone: existing.user.phone,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: existing.user,
    };
  }

  /**
   * Revokes a Refresh Token from the database
   */
  public static async revokeRefreshToken(token: string): Promise<void> {
    try {
      const existing = await prisma.refreshToken.findUnique({
        where: { token },
      });
      if (existing) {
        await prisma.refreshToken.delete({
          where: { id: existing.id },
        });
      }
    } catch (e) {
      console.error("Error revoking refresh token:", e);
    }
  }

  /**
   * Sets secure httpOnly cookies on the response
   */
  public static setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = process.env.NODE_ENV === "production";

    // 15-minute Access Token Cookie
    res.cookie("remind_access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 mins
      path: "/",
    });

    // 7-day Refresh Token Cookie
    res.cookie("remind_refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
  }

  /**
   * Clears auth cookies upon logout
   */
  public static clearAuthCookies(res: Response): void {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("remind_access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("remind_refresh_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });
  }
}
