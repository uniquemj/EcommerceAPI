import { Response, Router } from "express";
import { AuthRequest } from "../types/auth.types";
import { handleSuccessResponse } from "../utils/httpresponse.utils";
import createHttpError from "../utils/httperror.utils";
import { CartInfo } from "../types/payment.types";
import { PaymentServices } from "../services/payment.services";
import Logger from "../utils/logger.utils";
import winston from "winston";


export class PaymentController {
    readonly router: Router
    private static instance: PaymentController;

    private constructor(private readonly paymentServices: PaymentServices) {
        this.router = Router()
    }
    static initController(paymentServices: PaymentServices) {
        if (!PaymentController.instance) {
            PaymentController.instance = new PaymentController(paymentServices);
        }

        const instance = PaymentController.instance

        instance.router.post('/create-checkout-session', instance.createCheckoutSession)

        return instance
    }

    createCheckoutSession = async (req: AuthRequest, res: Response) => {
        try {
            const { cart_info, shipping_id }: { cart_info: CartInfo, shipping_id: string } = req.body

            const result = await this.paymentServices.createCheckoutSesstion(cart_info, shipping_id)
            handleSuccessResponse(res, "Checkout Session Created.", result)
        } catch (e: any) {
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}