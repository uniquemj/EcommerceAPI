import express from 'express'
import customerRoute from './user/customer.route'

const router = express.Router()


router.use('/auth/customers',customerRoute)

export default router