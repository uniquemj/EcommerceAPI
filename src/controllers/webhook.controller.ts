import { Request, Response, Router, raw } from "express";
import { WebhookServices } from "../services/webhook.services";
import { stripe } from "../config/stripe.config";
import createHttpError from "../utils/httperror.utils";
import Stripe from "stripe";
import { handleSuccessResponse } from "../utils/httpresponse.utils";


export class WebhookController {
    readonly router: Router
    private static instance: WebhookController;
  

    private constructor(private readonly webHookServices: WebhookServices) {
        this.router = Router()
    }

    static initController(webhookServices: WebhookServices) {
        if (!WebhookController.instance) {
            WebhookController.instance = new WebhookController(webhookServices);
        }

        const instance = WebhookController.instance

        instance.router.post('/stripe-webhook', instance.handleStripeWebhook.bind(instance))

        return instance
    }

    // controllers/webhook.controller.ts
    async handleStripeWebhook (req: Request, res: Response){
        try{
            const sig = req.headers['stripe-signature'] as string;
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
            
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            } catch (err: any) {
                throw createHttpError.BadRequest(`Webhook Error: ${err.message}`);
            }

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object as Stripe.Checkout.Session;
                // Retrieve payment intent if you need more details
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    session.payment_intent as string
                );


                // Create order
                try {
                    await this.webHookServices.createTempOrder(session, paymentIntent.id)
                } catch (error) {
                    console.error('Order creation failed:', error);
                }
            }

            handleSuccessResponse(res, 'Handling Stripe Webhook', {received: true})
        } catch(error: any){
            throw createHttpError.Custom(error.statusCode, error.message, error.errors)
        }
    };
}