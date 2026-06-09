const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendVerificationEmail = async (
    email,
    verificationLink
) => {

    const html = await ejs.renderFile(
        path.join(process.cwd(), "views", "verification.ejs"),
        {
            verificationLink,
            expiryTime: "24 hours"
        }
    );

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email",
        html
    });

};

module.exports = {
    sendVerificationEmail
};