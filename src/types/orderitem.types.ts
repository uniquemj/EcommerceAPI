import { CartItem } from "./cart.types";
import { OrderStatus } from "./order.types";


export interface OrderItemInfo{
    order_id: string,
    item: CartItem,
    order_status?: OrderStatus,
    cancelAt?: Date,
    isDeleted?: boolean,
    deletedAt?: Date
}