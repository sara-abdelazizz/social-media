import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { template } from "../email/verify.email.template";
import { sendEmail } from "../email/send.email";


export const emailEvent = new EventEmitter();

interface IEmail extends Mail.Options {
    otp: number;
    username: string;
}

emailEvent.on("confirm email" , async(data:IEmail )=>{
    try {
        data.subject = "Confirm your email",
        data.html = template(data.otp , data.username , data.subject)
        await sendEmail(data)
    } catch (error) {
        console.log("failed to send email" , error)
    }
})

