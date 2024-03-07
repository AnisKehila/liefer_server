import { Router, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../db";
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from "../utils/config";
import { loginSchema, signUpSchema } from "../schema/userSchema";
import { nanoid } from "nanoid";
import { auth } from "../utils/helpers";
import { refreshSchema } from "../schema/jwtSchema";

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
  const user = await db.user.findFirst({
    where: { phone },
  });

  if (!(user !== null && (await bcrypt.compare(password, user.password)))) {
    return res.status(401).json({ message: "invalid credintials" });
  }
  // Create JWT token with user ID and role
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    ACCESS_SECRET_KEY,
    {
      expiresIn: "7m",
    }
  );
  const refreshTokenId = nanoid(10);
  const refreshToken = jwt.sign(
    { id: refreshTokenId, userId: user.id },
    REFRESH_SECRET_KEY
  );
  try {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await db.token.create({
      data: {
        id: refreshTokenId,
        token: hashedToken,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error", err });
  }
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
  });
  res.status(200).json({
    accessToken,
    user: {
      user: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailConfirmed: user.isEmailConfirmed,
      isPhoneConfirmed: user.isPhoneConfirmed,
    },
  });
});

userRouter.get("/refresh", async (req, res) => {
  const refreshToken = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "no token" });
  }
  const decoded = refreshSchema.safeParse(jwt.decode(refreshToken.jwt));
  if (!decoded.success) {
    return res
      .status(401)
      .json({ message: "Invalide token!", data: decoded.error });
  }
  const { id, userId } = decoded.data;
  const findToken = await db.token.findFirst({
    where: {
      id: id,
    },
  });
  if (!findToken) {
    return res.status(401).json({ message: "token not found" });
  }
  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });
  if (!user) {
    return res.status(401).json({ message: "user account not found!" });
  }
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    ACCESS_SECRET_KEY,
    {
      expiresIn: "7m",
    }
  );
  return res.status(200).json({ token: accessToken });
});

userRouter.get("/me", auth, async (req, res) => {
  const { id } = req.body.decoded;
  console.log(req.body);
  const user = await db.user.findFirst({
    where: { id },
  });

  if (!user) {
    return res.status(401).json({ message: "User not found!" });
  }

  res.status(200).json({
    user: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isEmailConfirmed: user.isEmailConfirmed,
    isPhoneConfirmed: user.isPhoneConfirmed,
  });
});

export default userRouter;
