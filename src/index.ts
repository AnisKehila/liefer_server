import express, { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PORT, SECRET_KEY } from "./utils/config";
import userRouter from "./routes/user";
import middleware from "./utils/middleware";
import "express-async-errors";

const app = express();

app.use(express.json()); // Parse incoming JSON requests
app.use("/user", userRouter);

app.get("/protected", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, SECRET_KEY);
  res.status(200).json({ message: "Authenticated", user: decoded });
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
