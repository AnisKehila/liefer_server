import { Router, RequestHandler } from "express";
import db from "../db";
import { auth } from "../utils/helpers";

const packageRouter = Router();

packageRouter.get("/", auth, (req, res) => {
  console.log(req.body);
});

export default packageRouter;
