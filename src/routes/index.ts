import express from 'express'
import { CustomerController } from '../controllers/user/customer.controller'
import { SellerController } from '../controllers/user/seller.controller'
import { CategoryController } from '../controllers/category.controller'
import { ProductController } from '../controllers/product.controller'
import { CartController } from '../controllers/cart.controller'
import { verifyToken } from '../middlewares/auth.middleware'
import { OrderController } from '../controllers/order.controller'
import { ShipmentAddressController } from '../controllers/shipmentAddress.controller'
import { CustomerServices } from '../services/user/customer.services'
import { CustomerRepository } from '../repository/user/customer.repository'
import { SellerServices } from '../services/user/seller.services'
import { SellerRepository } from '../repository/user/seller.repository'
import { CategoryRepository } from '../repository/category.repository'
import { CategoryServices } from '../services/category.services'
import { ProductRepository } from '../repository/product.repository'
import { ProductServices } from '../services/product.services'
import { VariantRepository } from '../repository/variant.repository'
import { VariantServices } from '../services/variant.services'
import { CartRepository } from '../repository/cart.repository'
import { CartServices } from '../services/cart.services'
import { OrderRepository } from '../repository/order.repository'
import { OrderServices } from '../services/order.services'
import { OrderItemRepository } from '../repository/orderitem.repository'
import { OrderItemServices } from '../services/orderItem.services'
import { ShipmentAddressRepository } from '../repository/shipmentAddress.repository'
import { ShipmentAddressServices } from '../services/shipmentAddress.services'
import { AdminRepository } from '../repository/user/admin.repository'
import { AdminServices } from '../services/user/admin.services'
import { AdminController } from '../controllers/user/admin.controller'
import { AuthController } from '../controllers/auth.controller'
import { AuthServiceFactory } from '../controllers/authFactory'
import Logger from '../utils/logger.utils'


const router = express.Router()
//
const logger = Logger.getInstance()


//Category
const cateogryRepository = new CategoryRepository()
const categoryServices = new CategoryServices(cateogryRepository)
const categoryController = CategoryController.initController(categoryServices, logger)


//Variant
const variantRepository = new VariantRepository()
const variantServices = new VariantServices(variantRepository)

//Product
const productRepository = new ProductRepository()
const productServices = new ProductServices(productRepository, categoryServices, variantServices)
const productController = ProductController.initController(productServices, logger)

// Cart
const cartRepository = new CartRepository()
const cartServices = new CartServices(cartRepository, variantServices)
const cartController = CartController.initController(cartServices, logger)

//Order item
const orderItemRepository = new OrderItemRepository()
const orderItemServices = new OrderItemServices(orderItemRepository, variantServices)

// Orderr
const orderRepository = new OrderRepository()
const orderServices = new OrderServices(orderRepository, cartServices, orderItemServices, variantServices, productServices)
const orderController = OrderController.initController(orderServices, orderItemServices, logger)

// Shipment Address
const shipmentRepository = new ShipmentAddressRepository()
const shipmentServices = new ShipmentAddressServices(shipmentRepository)
const shipmetAddressController = ShipmentAddressController.initController(shipmentServices, logger)


//User
const adminRepository = new AdminRepository()
const adminServices = new AdminServices(adminRepository)
const adminController = AdminController.initController(adminServices, logger)

const customerRepository = new CustomerRepository()
const customerService = new CustomerServices(customerRepository)
const customerController = CustomerController.initController(customerService, logger)

const sellerRepository = new SellerRepository()
const sellerService = new SellerServices(sellerRepository, productServices)
const sellerController = SellerController.initController(sellerService, logger)

const authServiceFactory = new AuthServiceFactory(adminServices, customerService, sellerService)
const authController = AuthController.initController(authServiceFactory, logger)

//User Route
router.use('/auth', authController.router)

// router.use('/auth/admin', adminController.router)
// router.use('/auth/customer', customerController.router)
// router.use('/auth/seller', sellerController.router)
router.use('/admin', adminController.router)
router.use('/customer', customerController.router)
router.use('/seller', sellerController.router)

//Product Route
router.use('/products',verifyToken, productController.router)

// Category Route
router.use('/category', verifyToken, categoryController.router)

// Cart Route
router.use('/carts',verifyToken, cartController.router)

// Order Route
router.use('/orders', verifyToken, orderController.router)

//Shipment Address Route
router.use('/shipment', verifyToken, shipmetAddressController.router)

export default router