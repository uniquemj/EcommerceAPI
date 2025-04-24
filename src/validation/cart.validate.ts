import {z} from 'zod'


export const addCartSchema = z.object({
    quantity: z.number({message: "Quantity should be number and should be positive number."}).min(1)
})

export const updateCartSchema = z.object({
    quantity: z.number({message: "Quantity should be number and should be greater than or equan to 0"}).min(0)
})