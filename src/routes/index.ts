import express from 'express'
import { CustomerController } from '../controllers/user/customer.controller'
import { SellerController } from '../controllers/user/seller.controller'
import { CategoryController } from '../controllers/category/category.controller'
import { ProductController } from '../controllers/product/product.controller'

const router = express.Router()

//User
const customerController = CustomerController.initController()
const sellerController = SellerController.initController()

//Category
const categoryController = CategoryController.initController()

//Product
const productController = ProductController.initController()

//User Route
router.use('/auth/customers',customerController.router)
router.use('/auth/seller', sellerController.router)

//Product Route
router.use('/products', productController.router)

// Category Route
router.use('/category', categoryController.router)

export default router