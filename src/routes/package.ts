import { Response, Router } from 'express'
import db from '../db'
import { auth } from '../utils/helpers'

const packageRouter = Router()

packageRouter.get('/count', auth('ADMIN'), async (res: Response) => {
  const data = await db.package.findMany({
    select: {
      status: true
    }
  })
  if (!data) {
    return res.status(401).json({ message: 'No data!' })
  }
  const count = {
    total: data.length,
    pending: data.filter(({ status }) => status.name === 'PENDING').length,
    confirmed: data.filter(({ status }) => status.name === 'CONFIRMED').length,
    recieved: data.filter(({ status }) => status.name === 'RECIEVED').length,
    inOffice: data.filter(({ status }) => status.name === 'IN_OFFICE').length,
    onRoad: data.filter(({ status }) => status.name === 'ON_ROAD').length,
    delivered: data.filter(({ status }) => status.name === 'DELIVERED').length,
    canceled: data.filter(({ status }) => status.name === 'CANCELED').length,
    returned: data.filter(({ status }) => status.name === 'RETURNED').length
  }
  return res.json({ count })
})

export default packageRouter
