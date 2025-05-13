import {container} from 'tsyringe'
import { AuditTrailServices } from '../services/audit.services'
import { AuditTrailRepository } from '../repository/audit.repository'
import { AdminRepositoryInterface, AuditTrailRepositoryInterface, CartRepositoryInterface, CategoryRepositoryInterface, CustomerRepositoryInterface, FileRepositoryInterface, OrderItemRepositoryInterface, OrderRepositoryInterface, ProductRepositoryInterface, SellerRepositoryInterface, ShipmentAddressRepositoryInterface, VariantRepositoryInterface } from '../types/repository.types'
import { AdminRepository } from '../repository/user/admin.repository'
import { AdminServices } from '../services/user/admin.services'
import { CustomerRepository } from '../repository/user/customer.repository'
import { CustomerServices } from '../services/user/customer.services'
import { ProductRepository } from '../repository/product.repository'
import { ProductServices } from '../services/product.services'
import { SellerRepository } from '../repository/user/seller.repository'
import { CategoryRepository } from '../repository/category.repository'
import { CategoryServices } from '../services/category.services'
import { VariantRepository } from '../repository/variant.repository'
import { VariantServices } from '../services/variant.services'
import { AuthServiceFactory } from '../controllers/authFactory'
import { CartRepository } from '../repository/cart.repository'
import { CartServices } from '../services/cart.services'
import { OrderItemRepository } from '../repository/orderitem.repository'
import { OrderItemServices } from '../services/orderItem.services'
import { OrderRepository } from '../repository/order.repository'
import { OrderServices } from '../services/order.services'
import { EmailServices } from '../services/email.services'
import { NotificationServices } from '../services/notification.services'
import { ShipmentAddressRepository } from '../repository/shipmentAddress.repository'
import { ShipmentAddressServices } from '../services/shipmentAddress.services'
import { FileRepository } from '../repository/file.repository'
import { FileServices } from '../services/file.services'
import { CloudServices } from '../services/cloud.services'

//Audit
container.register<AuditTrailRepositoryInterface>('AuditTrailRepositoryInterface', {useClass: AuditTrailRepository})
container.register(AuditTrailServices, {useClass: AuditTrailServices})

//User

//Auth
container.register(AuthServiceFactory, {useClass: AuthServiceFactory})

//Admin
container.register<AdminRepositoryInterface>('AdminRepositoryInterface', {useClass: AdminRepository})
container.register(AdminServices, {useClass: AdminServices})

// Customer
container.register<CustomerRepositoryInterface>('CustomerRepositoryInterface', {useClass: CustomerRepository})
container.register(CustomerServices, {useClass: CustomerServices})

//Seller
container.register<SellerRepositoryInterface>('SellerRepositoryInterface', {useClass: SellerRepository})

//Email
container.register(EmailServices, {useClass: EmailServices})

//Product
container.register<ProductRepositoryInterface>('ProductRepositoryInterface', {useClass: ProductRepository})
container.register(ProductServices, {useClass: ProductServices})


//category
container.register<CategoryRepositoryInterface>('CategoryRepositoryInterface', {useClass: CategoryRepository})
container.register(CategoryServices, {useClass: CategoryServices})

//Variant
container.register<VariantRepositoryInterface>('VariantRepositoryInterface', {useClass: VariantRepository})
container.register(VariantServices, {useClass: VariantServices})


//Cart
container.register<CartRepositoryInterface>('CartRepositoryInterface', {useClass: CartRepository})
container.register(CartServices, {useClass: CartServices})

//Order and Order Items

//OrderItems
container.register<OrderItemRepositoryInterface>('OrderItemRepositoryInterface', {useClass: OrderItemRepository})
container.register(OrderItemServices, {useClass: OrderItemServices})

//Order
container.register<OrderRepositoryInterface>('OrderRepositoryInterface', {useClass: OrderRepository})
container.register(OrderServices, {useClass: OrderServices})


//Shipping Address
container.register<ShipmentAddressRepositoryInterface>('ShipmentAddressRepositoryInterface', {useClass: ShipmentAddressRepository})
container.register(ShipmentAddressServices, {useClass: ShipmentAddressServices})

// Notification
container.register(NotificationServices, {useClass: NotificationServices})

// File
container.register<FileRepositoryInterface>('FileRepositoryInterface', {useClass : FileRepository})
container.register(FileServices, {useClass: FileServices})

//cloud
container.register(CloudServices, {useClass: CloudServices})
export {container}