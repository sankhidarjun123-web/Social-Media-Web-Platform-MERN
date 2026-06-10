const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

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

    console.log("EMAIL:", process.env.EMAIL);
    console.log("APP_PASSWORD exists:", !!process.env.APP_PASSWORD);
    dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log("SMTP addresses:");
        console.log(addresses);
    });

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