import nodemailer from 'nodemailer'

const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD
const HOST = process.env.HOST as string
const EMAIL_PORT= Number(process.env.EMAIL_PORT)

const transporter = nodemailer.createTransport({
    host: HOST,
    port: EMAIL_PORT,
    secure: true,
    auth:{
        user: EMAIL,
        pass: PASSWORD
    }
})


export const sendMail = async(to: string, code: string)=>{
    try{
        const url = `http:localhost:8000/api/auth/customers/verify/${code}`

        const sent = await transporter.sendMail({
            from : EMAIL,
            to: to,
            subject: "Verify Your Account.",
            html:`
            <div style = "line-heigh:1.6;">
            <h1>Thank you for Signing Up</h1>
            <p>Dear Customer, Thank you for signing up. Please verify your account by clicking the button below:</p>
            <a href=${url}>${url}</a>
            <br>
            <p>Regards,</p>
            <p>TheMark</p>
            </div>
            `
        })
        if(!sent){
            return false
        }
        return true
    } catch(error){
        throw error
    }
}