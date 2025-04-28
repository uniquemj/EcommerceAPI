import { CartItem } from "./cart.types";


export interface OrderItemInfo{
    order_id?: string,
    item?: CartItem,
    seller_id?: string,
    order_status?: string,
}