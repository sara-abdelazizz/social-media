import { createTransport, Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";


export const sendEmail = async (data: Mail.Options) => {
    const transporter: Transporter = createTransport({
       service:"Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.PASSWORD
        }
    });
    const info = await transporter.sendMail({
        ...data,
        from: `"Route Academy <${process.env.EMAIL_USER as string}>" `
    })
    console.log("message sent :%s", info.messageId)
}