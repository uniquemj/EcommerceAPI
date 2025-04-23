import { CartItem } from "./cart.types";
import { OrderStatus } from "./order.types";


export interface OrderItemInfo{
    order_id: string,
    item: CartItem,
    seller_id: string,
    order_status?: OrderStatus,
    cancelAt?: Date,
    isDeleted?: boolean,
    deletedAt?: Date
}