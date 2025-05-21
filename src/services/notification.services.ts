import { EmailServices } from "./email.services";
import { CustomerServices } from "./user/customer.services";
import { SellerServices } from "./user/seller.services";

import { OrderItemSummary} from "../types/email.types";
import { CartInputItem, CartItem } from "../types/cart.types";
import { VariantServices } from "./variant.services";
import { ProductServices } from "./product.services";
import { inject, injectable } from "tsyringe";

@injectable()
export class NotificationServices{
    constructor(@inject(EmailServices) private readonly emailServices: EmailServices, 
        @inject(VariantServices) private readonly variantServices: VariantServices, 
        @inject(ProductServices) private readonly productServices: ProductServices,){}

    sendOrderNotification = async(orderId: string, fullname:string, email: string, orderTotal: number, orderItems: CartInputItem[]) =>{
        try{

            const summary = await this.getOrderSummary(orderId, fullname, orderTotal, orderItems)
            
            await this.emailServices.sendEmail(
                email,
                "Order Confirmation.",
                summary
            )
        } catch(error){
            throw error
        }
    }

    getOrderSummary = async(orderId: string, customerId: string, orderTotal: number, orderItems: CartInputItem[]): Promise<string>=>{

        let productDetail: OrderItemSummary[] = await Promise.all(orderItems.map(async(item)=>{
            const product_id = await this.variantServices.getVariantProduct(item.productVariant)
            const product = await this.productServices.getProductById(product_id as unknown as string)
            const variantDetail = await this.variantServices.getVariant(item.productVariant)

            return {product_name: product.name, variantColor: variantDetail.color, variantSize: variantDetail.size, quantity: item.quantity}
        }))

        let orderItemList = ""

        productDetail.forEach((item) =>{
            orderItemList += `<tr><td style="border:1px solid #ddd;padding:10px;">${item.product_name}</td>
                                <td style="border:1px solid #ddd;padding:10px;">${item.variantColor}</td>
                                <td style="border:1px solid #ddd;padding:10px;">${item.variantSize || "-"}</td>
                                <td style="border:1px solid #ddd;padding:10px;">${item.quantity}</td></tr>`
        })

        const summary = `<!DOCTYPE html>
        <html lang="en">
          <body style="margin:0;padding:0;background-color:#f6f6f6;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:20px auto;background-color:#ffffff;padding:20px;border-radius:6px;box-shadow:0 0 10px rgba(0,0,0,0.1);">
              <div style="background-color:#4CAF50;color:white;padding:20px;text-align:center;border-radius:6px 6px 0 0;">
                <h1 style="margin:0;">Order Confirmation</h1>
              </div>
              <div style="padding:20px;color:#333333;">
                <h2 style="margin-top:0;">Hello ${customerId},</h2>
                <p style="font-size:16px;">Thank you for your order. Below are your order details:</p>
        
                <p style="font-size:16px;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="font-size:16px;"><strong>Total:</strong> Rs. ${orderTotal}</p>
        
                <h3 style="margin-top:30px;">Items:</h3>
                <table style="width:100%;border-collapse:collapse;margin-top:10px;">
                  <thead>
                    <tr>
                      <th style="padding:12px;border:1px solid #dddddd;text-align:left;">Product</th>
                      <th style="padding:12px;border:1px solid #dddddd;text-align:left;">Color</th>
                      <th style="padding:12px;border:1px solid #dddddd;text-align:left;">Size</th>
                      <th style="padding:12px;border:1px solid #dddddd;text-align:left;">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemList}
                  </tbody>
                </table>
        
                <p style="margin-top:30px;">Thank you for shopping with us! :)</p>
                <h3>Regards,</h3>
                <p>BajarHub Team</p>
              </div>
              <div style="text-align:center;font-size:12px;color:#999;padding:20px;">
                &copy; BajarHub. All rights reserved.
              </div>
            </div>
          </body>
        </html>`
        
        return summary
    }   

    sendEmailVerification = async(fullname: string, email: string, code: string) =>{
      try{
        const verificationMessage = this.getEmailVerificationMessage(fullname, code)

        await this.emailServices.sendEmail(
          email,
          "Verify Your Email.",
          verificationMessage
        )
      } catch(error){
        throw error
      }
    }

    getEmailVerificationMessage = (fullname: string, code: string) =>{
      const verificationLink = `${process.env.ORIGIN_URL}/verify/${code}`
      const year = new Date().getFullYear()
      return `
      <!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f6f6f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:20px auto;background-color:#ffffff;padding:20px;border-radius:6px;box-shadow:0 0 10px rgba(0,0,0,0.1);">
      <div style="background-color:#007BFF;color:white;padding:20px;text-align:center;border-radius:6px 6px 0 0;">
        <h1 style="margin:0;">Verify Your Email</h1>
      </div>
      <div style="padding:20px;color:#333333;">
        <p style="font-size:16px;">Hello ${fullname},</p>
        <p style="font-size:16px;">Thank you for registering with BajarHub!</p>
        <p style="font-size:16px;">To complete your registration and activate your account, please verify your email by clicking the button below:</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${verificationLink}" target="_blank" style="display:inline-block;background-color:#007BFF;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:4px;font-size:16px;">Verify Email</a>
        </div>

        <p style="font-size:14px;color:#555;">If the button doesn’t work, copy and paste the following link into your browser:</p>
        <p style="font-size:14px;word-break:break-all;"><a href="${verificationLink}" style="color:#007BFF;">${verificationLink}</a></p>

        <p style="margin-top:30px;">If you did not create an account, you can safely ignore this email.</p>

        <h3 style="margin-top:30px;">Regards,</h3>
        <p>BajarHub Team</p>
      </div>
      <div style="text-align:center;font-size:12px;color:#999;padding:20px;">
        &copy; ${year} BajarHub. All rights reserved.
      </div>
    </div>
  </body>
</html>`
    }
}