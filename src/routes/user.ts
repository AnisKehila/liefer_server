import { Router, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../db";
import { SECRET_KEY } from "../utils/config";
import { loginSchema, signUpSchema } from "../schema/userSchema";

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  console.log(req.body);
  const data = signUpSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({
      message: "missing or invalid parameter(s)",
      error: data.error.issues,
    });
  }
  const { email, name, password, phone } = data.data;
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    return res
      .status(409)
      .json({ message: "User with email or phone already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!", data: err });
  }
});

userRouter.post("/login", async (req, res) => {
  const data = loginSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({
      message: "missing or invalid parameter(s)",
      error: data.error.issues,
    });
  }
  const { phone, password } = data.data;
  const user = await db.user.findUnique({
    where: { phone },
  });

  if (!(user !== null && (await bcrypt.compare(password, user.password)))) {
    return res.status(401).json({ message: "invalid credintials" });
  }
  // Create JWT token with user ID and role
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.status(200).json({ token });
});

export default userRouter;
