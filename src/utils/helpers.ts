import { NextFunction, Request, Response } from 'express'
import { ACCESS_SECRET_KEY } from './config'
import jwt from 'jsonwebtoken'
import { accessSchema } from '../schema/jwtSchema'
import { Role } from './types'

export const tokenExtractor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization
  const token =
    authorization && authorization.toLowerCase().startsWith('bearer ')
      ? authorization.substring(7)
      : null
  if (!token) {
    return res.status(401).json({ message: 'Token is missing!' })
  }
  const decoded = accessSchema.safeParse(jwt.verify(token, ACCESS_SECRET_KEY))
  if (!decoded.success) {
    return res
      .status(401)
      .json({ message: 'Invalide token!', data: decoded.error })
  }

  req.body.token = decoded.data
  return next()
}

export const auth =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    tokenExtractor(req, res, () => {
      const { role } = req.body.token
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Forbidden' })
      }
      return next()
    })
  }
