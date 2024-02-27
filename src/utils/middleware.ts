import { Response, Request, NextFunction } from "express";
import { ZodError, z } from "zod";
import { Prisma } from "@prisma/client";

const unknownEndpoint = (_req: Request, res: Response) => {
  return res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("The error handler have been called");

  if (error instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "missing or invalid parameter(s)", data: error.format() });
  }

  // verify token hasn't expired yet
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Expired token" });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "invalid token" });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const message = (() => {
      switch (error.code) {
        case "P2002":
          // handling duplicate key errors
          return `Duplicate field value: ${error.meta?.target}`;
        case "P2014":
          // handling invalid id errors
          return `Invalid ID: ${error.meta?.target}`;
        case "P2003":
          // handling invalid data errors
          return `Invalid input data: ${error.meta?.target}`;
        default:
          // handling all other errors
          return null;
      }
    })();

    if (!message) {
      return res
        .status(500)
        .json({ error: `Something went wrong: ${error.message}`, data: error });
    }
    return res.status(400).json({ error: message, data: error });
  }

  res.status(500).json({ error: error.message });
  return next(error);
};

export default {
  errorHandler,
  unknownEndpoint,
};
