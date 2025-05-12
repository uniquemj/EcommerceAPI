import { AdminInfo, AdminProfile, CustomerInfo, CustomerProfile, SearchUserField, SellerInfo, SellerProfile, UserCredentials, VerifyField } from "../types/user.types";
import { AuditTrailInfo } from "./audit.types";
import { CartInfo, CartInputInfo, CartInputItem } from "./cart.types";
import { CategoryInfo, CategoryInputInfo } from "./category.types";
import { ImageInfo } from "./image.types";
import { orderFilter, OrderInfo, OrderInputInfo, orderItemFilter } from "./order.types";
import { OrderItemInfo, OrderItemInputInfo } from "./orderitem.types";
import { ProductFilter, ProductInfo, ProductInputInfo } from "./product.types";
import { ShipmentInfo, ShipmentInputInfo } from "./shipment.types";
import { VariantInfo, VariantInput } from "./variants.types";


export interface AdminRepositoryInterface{
    getAllAdmin(): Promise<AdminInfo[]>,
    getAdminById(id: string): Promise<AdminInfo | null>,
    getAdminByEmail(email: string): Promise<AdminInfo | null>,
    createAdmin(adminInfo: AdminInfo): Promise<AdminInfo | null>,
    loginAdmin(userCredentials: UserCredentials): Promise<{token: string, user: AdminInfo}>,
    updateAdmin(adminInfo: AdminProfile, adminId: string): Promise<AdminInfo | null>,
    deleteAdmin(adminId: string): Promise<AdminInfo | null>
}

export interface CustomerRepositoryInterface{
    getCustomerList(): Promise<CustomerInfo[]>,
    getCustomerById(id: string): Promise<CustomerInfo | null>,
    getCustomerByEmail(email: string): Promise<CustomerInfo | null>,
    registerCustomer(userInfo: Partial<CustomerInfo>): Promise<CustomerInfo | null>
    verify(search: SearchUserField, verifyStatus: VerifyField): Promise<CustomerInfo | null>
    loginCustomer(userCredentials: UserCredentials): Promise<{token: string, user: CustomerInfo}>,
    updateCustomerInfo(userId: string, updateInfo: CustomerProfile): Promise<CustomerInfo | null>,
    deleteCustomer(customerId: string): Promise<CustomerInfo | null>
}

export interface SellerRepositoryInterface{
    getSellerList(): Promise<SellerInfo[]>,
    getSellerById(id: string): Promise<SellerInfo|null>,
    getSeller(email: string): Promise<SellerInfo | null>,
    registerSeller(sellerInfo: Partial<SellerInfo>): Promise<SellerInfo|null>,
    verify(search: SearchUserField, verifyStatus: VerifyField): Promise<SellerInfo|null>
    loginSeller(sellerCredentials: UserCredentials): Promise<{token: string, user: SellerInfo}>,
    updateSellerInfo(sellerInfo: SellerProfile, sellerId: string): Promise<SellerInfo | null>
    deleteSeller(sellerId: string): Promise<SellerInfo | null>
}

export interface CartRepositoryInterface{
    createCart(cartInfo: CartInputInfo): Promise<CartInfo>,
    getCartItem(userId: string, itemId: string): Promise<CartInfo | null>,
    getCartByUserId(userId: string): Promise<CartInfo | null>,
    addItemToCart(itemId: CartInputItem, userId: string): Promise<CartInfo | null>
    removeItemFromCart(itemId: string, userId: string): Promise<CartInfo | null>
    updateQuantity(quantity: number, userId: string, itemId: string): Promise<CartInfo|null>
    resetCart(userId: string): Promise<void>
}

export interface CategoryRepositoryInterface{
    getCategoryList(): Promise<CategoryInfo[]>,
    getCategoryByTitle(title: string): Promise<CategoryInfo|null>,
    getCategoryById(id: string): Promise<CategoryInfo | null>,
    createCategory(categoryInfo: CategoryInputInfo): Promise<CategoryInfo>
    updateCategory(id: string, categoryInfo: Partial<CategoryInputInfo>): Promise<CategoryInfo | null>,
    removeCategory(id: string): Promise<CategoryInfo | null>
}

export interface OrderRepositoryInterface{
    getOrderList(query: orderFilter): Promise<OrderInfo[]>
    getCustomerOrderList(userId: string): Promise<OrderInfo[]>
    getCustomerOrder(orderId: string, userId: string): Promise<OrderInfo[]>
    getOrderById(orderId: string): Promise<OrderInfo|null>
    createOrder(orderInfo: OrderInputInfo): Promise<OrderInfo | null>
    updateOrder(orderId: string, updateInfo: Partial<OrderInputInfo>): Promise<OrderInfo | null>
}

export interface OrderItemRepositoryInterface{
    createOrderItem(orderItemInfo: Partial<OrderItemInputInfo>): Promise<OrderItemInfo>,
    getOrderItemById(orderId: string): Promise<OrderItemInfo | null>,
    getOrderItemList(orderId: string, query: orderItemFilter): Promise<OrderItemInfo[]>
    getAllOrderItems(query: orderItemFilter): Promise<OrderItemInfo[]>
    getOrderForSeller(userId: string, query: orderItemFilter): Promise<OrderItemInfo[]>
    updateOrderItem(updateOrderItemInfo: Partial<OrderItemInfo>, orderItemId: string): Promise<OrderItemInfo|null>
}

export interface ProductRepositoryInterface{
    getAllProducts(query: ProductFilter): Promise<ProductInfo[]>,
    getProductList(): Promise<ProductInfo[]>,
    getProductById(id: string): Promise<ProductInfo|null>,
    getSellerProductList(sellerId: string, query: ProductFilter): Promise<ProductInfo[]>
    getSellerProductById(id: string, userId: string): Promise<ProductInfo | null>
    createProduct(productInfo: Partial<ProductInputInfo>): Promise<ProductInfo>,
    editProduct(productId: string, productInfo: Partial<ProductInputInfo>): Promise<ProductInfo|null>
    removeProduct(productId: string): Promise<ProductInfo | null>,
    removeCategoryFromProduct(productId: string, categoryId: string, userId: string): Promise<ProductInfo | null>
    removeVariant(productId: string, variantId: string): Promise<ProductInfo | null>
}

export interface ShipmentAddressRepositoryInterface{
    createShipmentAddress(shipmentInfo: ShipmentInputInfo): Promise<ShipmentInfo>
    getShipmentAddressList(customerId: string): Promise<ShipmentInfo[]>,
    getShipmentAddressById(addressId: string): Promise<ShipmentInfo | null>,
    updateShipmentAddress(addressId: string, updateAddressInfo: Partial<ShipmentInputInfo>): Promise<ShipmentInfo | null>
    deleteShipmentAddress(addressId: string): Promise<ShipmentInfo|null>
}

export interface VariantRepositoryInterface{
    createVariant(variantInfo: Partial<VariantInput>): Promise<VariantInfo>
    getVariant(variantId: string): Promise<VariantInfo|null>
    getVariantByProduct(productId: string): Promise<VariantInfo[]>
    updateVariant(variantId: string, updateInfo: VariantInfo): Promise<VariantInfo | null>
    deleteVariant(variantId: string): Promise<VariantInfo | null>,
    addImageToProductVariant(variantId: string, image: ImageInfo): Promise<VariantInfo | null>
    removeImageFromProductVariant(variantId: string, imageId: string): Promise<VariantInfo|null>,
    updateStock(variantId: string, quantity: number): Promise<VariantInfo | null>
}

export interface AuditTrailRepositoryInterface{
    findAll(): Promise<AuditTrailInfo[]>,
    create(payload: AuditTrailInfo): Promise<AuditTrailInfo>
}

