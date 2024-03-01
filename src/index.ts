import express from "express";
import { PORT } from "./utils/config";
import userRouter from "./routes/user";
import middleware from "./utils/middleware";
import "express-async-errors";

const app = express();

app.use(express.json());
app.use("/user", userRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
