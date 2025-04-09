import express from 'express'
import { CustomerController } from '../../controllers/user/customer.controller'

const router = express.Router()

const customerController = CustomerController.initController()

router.use('/', customerController.router)

export default router
