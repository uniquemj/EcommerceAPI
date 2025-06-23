import { injectable } from "tsyringe";
import { stripe } from "../config/stripe.config";
import { CartInfo } from "../types/payment.types";

@injectable()
export class PaymentServices {
    createCheckoutSesstion = async (cartInfo: CartInfo, shippingId: string) => {
        const lintItems = cartInfo.items.map((item) => ({
            price_data: {
                currency: 'npr',
                product_data: {
                    name: item.productVariant.product.name
                },
                unit_amount: Math.round(item.productVariant.price * 100),
            },
            quantity: item.quantity,
        }))

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lintItems,
            mode: "payment",
            success_url: `${process.env.ORIGIN_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.ORIGIN_URL}/cart`,
            metadata: {
                shippingId: shippingId,
                customerId: cartInfo.customer
            }
        })

        return {id: session.id}
    }
}