import { Router, RequestHandler } from "express";
import db from "../db";
import { auth } from "../utils/helpers";

const packageRouter = Router();

packageRouter.get("/count", auth, async (req, res) => {
  const { id } = req.body.decoded;
  const data = await db.package.findMany({
    where: {
      userId: id,
    },
    select: {
      status: true,
    },
  });
  if (!data)
    return res.status(401).json({ message: "This account has no data" });
  const count = {
    total: data.length,
    delivered: data.reduce((i, e) => (e.status === "DELIVERED" ? i + 1 : i), 0),
    confirmed: data.reduce((i, e) => (e.status === "CONFIRMED" ? i + 1 : i), 0),
    onRoad: data.reduce((i, e) => (e.status === "ON_ROAD" ? i + 1 : i), 0),
    returned: data.reduce((i, e) => (e.status === "RETURNED" ? i + 1 : i), 0),
  };
  res.json({ count });
});

export default packageRouter;
