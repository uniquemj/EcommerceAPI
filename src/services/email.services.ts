import nodemailer from 'nodemailer'
import { TransportOptionsWithUnknownProps } from '../types/email.types'


const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD
const clientId = process.env.OAUTH_CLIENTID
const clientSecret = process.env.OAUTH_CLIENT_SECRET
const refreshToken = process.env.OAUTH_REFRESH_TOKEN

export class EmailServices{
    private transporter: nodemailer.Transporter;
    private static instance: EmailServices;

    private constructor(){
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: EMAIL,
                pass: PASSWORD,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken
            } as TransportOptionsWithUnknownProps
        })
    }

    static getInstance(){
        if(!EmailServices.instance){
            EmailServices.instance = new EmailServices()
        }
        return EmailServices.instance
    }

    sendEmail = async(to:string, subject: string, body: string) : Promise<boolean>=>{
        try{
            const sent = await this.transporter.sendMail({
                from: `"Unique Maharjan" ${EMAIL}`,
                to,
                subject,
                html: body
            })
            if(!sent){
                return false
            }
            return true
        }catch(error){
            throw error
        }
    }
}