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
import { SellerServices } from '../services/user/seller.services'
import { CategoryServices } from '../services/category.services'
import { ProductServices } from '../services/product.services'
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
import { EmailServices } from '../services/email.services'
import { NotificationServices } from '../services/notification.services'
import { AuditTrailRepository } from '../repository/audit.repository'
import { AuditTrailServices } from '../services/audit.services'
import { AuditTrailController } from '../controllers/audit.controller'
import {container} from '../constant/container.dependencies'

const router = express.Router()

const logger = Logger.getInstance()
const emailService = EmailServices.getInstance()

//Category
const categoryServices = container.resolve(CategoryServices)
const categoryController = CategoryController.initController(categoryServices, logger)


//Variant
const variantServices = container.resolve(VariantServices)

//Product
const productServices = container.resolve(ProductServices)
const productController = ProductController.initController(productServices, variantServices, logger)


//User
const adminServices = container.resolve(AdminServices)
const adminController = AdminController.initController(adminServices, logger)

const customerService = container.resolve(CustomerServices)
const customerController = CustomerController.initController(customerService, logger)

const sellerService = container.resolve(SellerServices)
const sellerController = SellerController.initController(sellerService, logger)

// Cart
const cartServices = container.resolve(CartServices)
const cartController = CartController.initController(cartServices, logger)

//Order item
const orderItemServices = container.resolve(OrderItemServices)


// Orderr
const orderServices = container.resolve(OrderServices)
const orderController = OrderController.initController(orderServices, orderItemServices, logger)

// Shipment Address
const shipmentServices = container.resolve(ShipmentAddressServices)
const shipmetAddressController = ShipmentAddressController.initController(shipmentServices, logger)

// AuthContoller and AuthFactor
const authServiceFactory = container.resolve(AuthServiceFactory)
const authController = AuthController.initController(authServiceFactory, logger)

// Audit Trail
const auditTrailServices = container.resolve(AuditTrailServices)
const auditTrailController = AuditTrailController.initController(auditTrailServices)

//User Route
router.use('/auth', authController.router)

router.use('/admin', adminController.router)
router.use('/customer', customerController.router)
router.use('/seller', sellerController.router)

//Product Route
router.use('/products', productController.router)

// Category Route
router.use('/category', categoryController.router)

// Cart Route
router.use('/carts',verifyToken, cartController.router)

// Order Route
router.use('/orders', verifyToken, orderController.router)

//Shipment Address Route
router.use('/shipment', verifyToken, shipmetAddressController.router)

// Audit Trail Log
router.use('/audit-log', verifyToken, auditTrailController.router)

export default router