import { inject, injectable } from "tsyringe";
import { OrderServices } from "./order.services";
import Stripe from "stripe";
import { PaymentMethod } from "../types/order.types";

@injectable()
export class WebhookServices{
    constructor(@inject(OrderServices) private readonly orderServices: OrderServices){
    }

    createTempOrder = async(session: Stripe.Checkout.Session, paymentIntentId: string) => {

        const result = await this.orderServices.createOrder(session.metadata!.shippingId, session.metadata!.customerId, PaymentMethod.CARD, {paymentIntentId: paymentIntentId})
        return result
    }
}