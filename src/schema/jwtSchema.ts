import { z } from 'zod'

export const refreshSchema = z.object({
  id: z.string(),
  userId: z.number(),
  iat: z.number()
})

export const accessSchema = z.object({
  id: z.string(),
  userId: z.number(),
  role: z.enum(['CUSTOMER', 'DELIVERY', 'WORKER', 'ADMIN']),
  iat: z.number()
})
