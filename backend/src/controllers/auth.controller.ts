import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/db";
import { OtpService } from "../services/otp.service";
import { TokenService } from "../services/token.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// Validation Schemas
const sendOtpSchema = z.object({
  identifier: z.string().email("Please provide a valid email address"),
});

const verifyOtpSchema = z.object({
  identifier: z.string().email("Please provide a valid email address"),
  code: z.string().length(6, "OTP must be exactly 6 digits"),
});

const checkUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  emailVerificationToken: z.string().min(10, "Email verification token is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  identifier: z.string().min(3, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

const onboardSchema = z.object({
  referralSource: z.string().min(1, "Referral source is required"),
  phone: z.string().min(8, "A valid phone number is required"),
  timezone: z.string().optional(),
  preferredVoice: z.string().optional(),
});

export class AuthController {
  /**
   * Send 6-digit OTP to Email via Brevo
   * POST /api/auth/send-otp
   */
  public static async sendOtp(req: Request, res: Response): Promise<void> {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten() });
      return;
    }

    const { identifier } = parsed.data;

    try {
      const code = await OtpService.createOtp(identifier, "EMAIL");
      res.status(200).json({
        success: true,
        message: `Verification code sent to ${identifier}`,
        ...(process.env.NODE_ENV !== "production" ? { debugOtp: code } : {}),
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ success: false, message: "Failed to send verification code" });
    }
  }

  /**
   * Verify an Email OTP code and issue a temporary verification token
   * POST /api/auth/verify-otp
   */
  public static async verifyOtp(req: Request, res: Response): Promise<void> {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten() });
      return;
    }

    const { identifier, code } = parsed.data;

    try {
      const isValid = await OtpService.verifyOtp(identifier, code, "EMAIL");
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired verification code",
        });
        return;
      }

      // Generate signed token to verify email during registration
      const emailVerificationToken = TokenService.generateEmailVerificationToken(identifier);

      res.status(200).json({
        success: true,
        message: "Email address verified successfully!",
        emailVerificationToken,
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ success: false, message: "Verification failed" });
    }
  }

  /**
   * Real-time Debounced Username Availability Check
   * GET /api/auth/check-username?username=...
   */
  public static async checkUsername(req: Request, res: Response): Promise<void> {
    const usernameQuery = (req.query.username as string)?.trim().toLowerCase();

    const parsed = checkUsernameSchema.safeParse({ username: usernameQuery });
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        available: false,
        message: parsed.error.errors[0]?.message || "Invalid username format",
      });
      return;
    }

    const username = parsed.data.username;

    try {
      const existing = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
      });

      if (existing) {
        res.status(200).json({
          success: true,
          available: false,
          message: `@${username} is already taken`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        available: true,
        message: `@${username} is available!`,
      });
    } catch (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ success: false, message: "Database query failed" });
    }
  }

  /**
   * Complete Sign Up (Creates User, sets 3-Day Trial, issues Cookies)
   * POST /api/auth/register
   */
  public static async register(req: Request, res: Response): Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten() });
      return;
    }

    const { name, email, emailVerificationToken, username, password } = parsed.data;

    try {
      // 1. Verify email verification token
      const verifiedEmail = TokenService.verifyEmailVerificationToken(emailVerificationToken);
      if (!verifiedEmail || verifiedEmail.toLowerCase() !== email.toLowerCase()) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired email verification. Please verify your email again.",
        });
        return;
      }

      // 2. Check if email already registered
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingEmail) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please sign in.",
        });
        return;
      }

      // 3. Check if username already taken
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: {
            equals: username.toLowerCase(),
            mode: "insensitive",
          },
        },
      });
      if (existingUsername) {
        res.status(409).json({
          success: false,
          message: `Username @${username} is already taken. Please pick another.`,
        });
        return;
      }

      // 4. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 5. 3-Day Free Trial setup (expires in 72 hours, max 2 reminders)
      const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      // 6. Create User in MongoDB
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword,
          isEmailVerified: true,
          isPhoneVerified: false,
          isOnboarded: false,
          plan: "TRIAL",
          trialEndsAt,
          maxReminders: 2,
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          phone: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isOnboarded: true,
          plan: true,
          trialEndsAt: true,
          maxReminders: true,
          preferredVoice: true,
          timezone: true,
          createdAt: true,
        },
      });

      // 7. Generate JWT access token & database refresh token
      const accessToken = TokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
      });
      const refreshToken = await TokenService.createRefreshToken(user.id);

      // 8. Set secure httpOnly cookies
      TokenService.setAuthCookies(res, accessToken, refreshToken);

      res.status(201).json({
        success: true,
        message: "Account created successfully! Welcome to Remind.",
        data: {
          user,
        },
      });
    } catch (error: any) {
      console.error("Error during registration:", error);
      const isDbError =
        error?.message?.includes("Server selection timeout") ||
        error?.message?.includes("InternalError") ||
        error?.code === "P2010";

      const message = isDbError
        ? "MongoDB Atlas connection timed out. Please ensure your IP (or 0.0.0.0/0) is whitelisted in MongoDB Atlas Network Access."
        : error?.message || "Registration failed";

      res.status(500).json({ success: false, message });
    }
  }

  /**
   * Log In with Username or Email + Password (Cookie-Based Auth)
   * POST /api/auth/login
   */
  public static async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten() });
      return;
    }

    const { identifier, password } = parsed.data;
    const cleanId = identifier.trim().toLowerCase();

    try {
      // Find user by either email or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanId },
            { username: { equals: cleanId, mode: "insensitive" } },
          ],
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "No account found with this email or username.",
        });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
        return;
      }

      // Generate tokens
      const accessToken = TokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
      });
      const refreshToken = await TokenService.createRefreshToken(user.id);

      // Set secure httpOnly cookies
      TokenService.setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            isOnboarded: user.isOnboarded,
            plan: user.plan,
            trialEndsAt: user.trialEndsAt,
            maxReminders: user.maxReminders,
            preferredVoice: user.preferredVoice,
            timezone: user.timezone,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error: any) {
      console.error("Error during login:", error);
      const isDbError =
        error?.message?.includes("Server selection timeout") ||
        error?.message?.includes("InternalError") ||
        error?.code === "P2010";

      const message = isDbError
        ? "MongoDB Atlas connection timed out. Please ensure your IP (or 0.0.0.0/0) is whitelisted in MongoDB Atlas Network Access."
        : error?.message || "Login failed";

      res.status(500).json({ success: false, message });
    }
  }

  /**
   * Rotate Refresh Token and return fresh Access Token (Cookie-Based)
   * POST /api/auth/refresh
   */
  public static async refresh(req: Request, res: Response): Promise<void> {
    const oldRefreshToken = req.cookies?.remind_refresh_token;

    if (!oldRefreshToken) {
      res.status(401).json({
        success: false,
        message: "No refresh token available",
      });
      return;
    }

    try {
      const result = await TokenService.rotateRefreshToken(oldRefreshToken);

      if (!result) {
        TokenService.clearAuthCookies(res);
        res.status(401).json({
          success: false,
          message: "Refresh token expired or invalidated. Please log in again.",
        });
        return;
      }

      // Set fresh cookies
      TokenService.setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        success: true,
        message: "Session token refreshed",
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            username: result.user.username,
            phone: result.user.phone,
            isOnboarded: result.user.isOnboarded,
            plan: result.user.plan,
            trialEndsAt: result.user.trialEndsAt,
            maxReminders: result.user.maxReminders,
            preferredVoice: result.user.preferredVoice,
            timezone: result.user.timezone,
          },
        },
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ success: false, message: "Token refresh failed" });
    }
  }

  /**
   * Log Out User (Clears cookies & revokes refresh token)
   * POST /api/auth/logout
   */
  public static async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.remind_refresh_token;

    if (refreshToken) {
      await TokenService.revokeRefreshToken(refreshToken);
    }

    TokenService.clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }

  /**
   * Complete Onboarding Questionnaire
   * POST /api/auth/onboard
   */
  public static async onboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const parsed = onboardSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten() });
      return;
    }

    const { referralSource, phone, timezone, preferredVoice } = parsed.data;

    try {
      // Check if phone number is already registered to another user
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          id: { not: req.user.id },
        },
      });

      if (existingPhone) {
        res.status(409).json({
          success: false,
          message: "This phone number is already registered to another account.",
        });
        return;
      }

      // Update user record
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          referralSource,
          phone,
          timezone: timezone || req.user.timezone || "UTC",
          preferredVoice: preferredVoice || req.user.preferredVoice || "Elena",
          isOnboarded: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          phone: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isOnboarded: true,
          referralSource: true,
          plan: true,
          trialEndsAt: true,
          maxReminders: true,
          preferredVoice: true,
          timezone: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "Onboarding completed successfully!",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error("Error during onboarding:", error);
      res.status(500).json({ success: false, message: "Onboarding save failed" });
    }
  }

  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   */
  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }
}
