import express from 'express'
import { CustomerController } from '../controllers/user/customer.controller'
import { SellerController } from '../controllers/user/seller.controller'
import { CategoryController } from '../controllers/category/category.controller'
import { ProductController } from '../controllers/product/product.controller'
import { CartController } from '../controllers/cart/cart.controller'
import { verifyToken } from '../middlewares/auth.middleware'
import { OrderController } from '../controllers/order/order.controller'

const router = express.Router()

//User
const customerController = CustomerController.initController()
const sellerController = SellerController.initController()

//Category
const categoryController = CategoryController.initController()

//Product
const productController = ProductController.initController()

// Cart
const cartController = CartController.initController()

// Orderr
const orderController = OrderController.initController()

//User Route
router.use('/auth/customers',customerController.router)
router.use('/auth/seller', sellerController.router)

//Product Route
router.use('/products',verifyToken, productController.router)

// Category Route
router.use('/category', verifyToken, categoryController.router)

// Cart Route
router.use('/carts',verifyToken, cartController.router)

// Order Route
router.use('/orders', verifyToken, orderController.router)

export default router