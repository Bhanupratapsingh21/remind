import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Color code according to status
    let statusColor = "\x1b[32m"; // Green for 2xx
    if (statusCode >= 500) {
      statusColor = "\x1b[31m"; // Red for 5xx
    } else if (statusCode >= 400) {
      statusColor = "\x1b[33m"; // Yellow for 4xx
    } else if (statusCode >= 300) {
      statusColor = "\x1b[36m"; // Cyan for 3xx
    }

    const resetColor = "\x1b[0m";
    const dimColor = "\x1b[2m";
    const boldColor = "\x1b[1m";

    console.log(
      `${dimColor}[${timestamp}]${resetColor} ` +
      `${boldColor}${req.method}${resetColor} ` +
      `${req.originalUrl || req.url} ` +
      `${statusColor}${statusCode}${resetColor} ` +
      `${dimColor}(${duration}ms)${resetColor}`
    );

    // If there is a request body, log it (sanitizing sensitive keys like password)
    if (req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = { ...req.body };
      if ("password" in sanitizedBody) sanitizedBody.password = "******";
      if ("code" in sanitizedBody && sanitizedBody.code?.length === 6) {
        // Keep OTP visible in dev so user sees it in terminal
      }
      console.log(`   ${dimColor}↳ Body:${resetColor}`, JSON.stringify(sanitizedBody));
    }
  });

  next();
};
