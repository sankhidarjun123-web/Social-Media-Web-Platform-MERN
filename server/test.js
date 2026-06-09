require("dotenv").config();
const nodemailer = require("nodemailer");

async function test() {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });

    await transporter.verify();
    console.log("SMTP verified");
}

test().catch(console.error);