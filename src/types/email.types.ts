export interface TransportOptionsWithUnknownProps{
    [key: string]: unknown
}

export interface OrderItemSummary{
    product_name: string, 
    variantColor: string, 
    variantSize?: string, 
    quantity: number
}