import express from "express";
import { PORT } from "./utils/config";
import userRouter from "./routes/user";
import middleware from "./utils/middleware";
import cookieParser from "cookie-parser";
import "express-async-errors";
import packageRouter from "./routes/package";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/user", userRouter);
app.use("/package", packageRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
