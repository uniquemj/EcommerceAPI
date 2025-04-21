
export interface CartItem{
    productVariant: string,
    quantity: number
}

export interface CartInfo{
    customer: string,
    items: CartItem[]
}