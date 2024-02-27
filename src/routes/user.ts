import { Router, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../db";
import { SECRET_KEY } from "../utils/config";
import { loginSchema, signUpSchema } from "../schema/userSchema";

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
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

  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
    },
  });

  res.status(201).json({ message: "User created successfully", user });
});

userRouter.post("/login", async (req, res) => {
  const data = loginSchema.safeParse(req.body);

  if (!data.success) {
    return res.status(400).json({
      message: "missing or invalid parameter(s)",
      error: data.error.issues,
    });
  }
  const { email, password } = data.data;
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!(user !== null && (await bcrypt.compare(password, user.password)))) {
    return res.status(401).json({ error: "invalid username or password" });
  }
  // Create JWT token with user ID and role
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.status(200).json({ message: "Login successful", token });
});

export default userRouter;
