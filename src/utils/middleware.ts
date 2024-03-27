import { Response, Request } from 'express'

const unknownEndpoint = (_req: Request, res: Response) => {
  return res.status(404).send({ error: 'unknown endpoint' })
}

export default {
  unknownEndpoint
}
