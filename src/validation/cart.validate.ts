import {z} from 'zod'


export const addCartSchema = z.object({
    quantity: z.number({message: "Quantity should be number and should be positive number."}).min(1)
})

export const updateQuantitySchema = z.object({
    quantity: z.number({message: "Quantity should be number and should not be less than -1"}).min(-1)
})