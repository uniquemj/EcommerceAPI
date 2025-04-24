import express from 'express'
import { CustomerController } from '../controllers/user/customer.controller'
import { SellerController } from '../controllers/user/seller.controller'
import { CategoryController } from '../controllers/category/category.controller'
import { ProductController } from '../controllers/product/product.controller'
import { CartController } from '../controllers/cart/cart.controller'
import { verifyToken } from '../middlewares/auth.middleware'
import { OrderController } from '../controllers/order/order.controller'
import { ShipmentAddressController } from '../controllers/shipmentAddress/shipmentAddress.controller'
import { CustomerServices } from '../services/user/customer.services'
import { CustomerRepository } from '../repository/user/customer.repository'
import { SellerServices } from '../services/user/seller.services'
import { SellerRepository } from '../repository/user/seller.repository'
import { CategoryRepository } from '../repository/category/category.repository'
import { CategoryServices } from '../services/category/category.services'
import { ProductRepository } from '../repository/product/product.repository'
import { ProductServices } from '../services/product/product.services'
import { VariantRepository } from '../repository/variant/variant.repository'
import { VariantServices } from '../services/variant/variant.services'
import { CartRepository } from '../repository/cart/cart.repository'
import { CartServices } from '../services/cart/cart.services'
import { OrderRepository } from '../repository/order/order.repository'
import { OrderServices } from '../services/order/order.services'
import { OrderItemRepository } from '../repository/orderitem/orderitem.repository'
import { OrderItemServices } from '../services/orderItem/orderItem.services'
import { ShipmentAddressRepository } from '../repository/shipmentAddress/shipmentAddress.repository'
import { ShipmentAddressServices } from '../services/shipmentAddress/shipmentAddress.services'

const router = express.Router()

//User
const customerRepository = new CustomerRepository()
const customerService = new CustomerServices(customerRepository)
const customerController = CustomerController.initController(customerService)

const sellerRepository = new SellerRepository()
const sellerService = new SellerServices(sellerRepository)
const sellerController = SellerController.initController(sellerService)

//Category
const cateogryRepository = new CategoryRepository()
const categoryServices = new CategoryServices(cateogryRepository)
const categoryController = CategoryController.initController(categoryServices)


//Variant
const variantRepository = new VariantRepository()
const variantServices = new VariantServices(variantRepository)

//Product
const productRepository = new ProductRepository()
const productServices = new ProductServices(productRepository, categoryServices, variantServices)
const productController = ProductController.initController(productServices)

// Cart
const cartRepository = new CartRepository()
const cartServices = new CartServices(cartRepository, variantServices)
const cartController = CartController.initController(cartServices)

//Order item
const orderItemRepository = new OrderItemRepository()
const orderItemServices = new OrderItemServices(orderItemRepository)

// Orderr
const orderRepository = new OrderRepository()
const orderServices = new OrderServices(orderRepository, cartServices, orderItemServices, variantServices, productServices)
const orderController = OrderController.initController(orderServices, orderItemServices)

// Shipment Address
const shipmentRepository = new ShipmentAddressRepository()
const shipmentServices = new ShipmentAddressServices(shipmentRepository)
const shipmetAddressController = ShipmentAddressController.initController(shipmentServices)

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

//Shipment Address Route
router.use('/shipment', verifyToken, shipmetAddressController.router)

export default router