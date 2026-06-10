const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const dns = require("dns");

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // Helps prevent TLS connection rejections
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    secure: true,
    requireTLS: true,
    logger: true,
    debug: true
});

const sendVerificationEmail = async (
    email,
    verificationLink
) => {

    dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
        console.log(addresses);
    });
    const html = await ejs.renderFile(
        path.join(process.cwd(), "views", "verification.ejs"),
        {
            verificationLink,
            expiryTime: "24 hours"
        }
    );

    const mailData = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email",
        html
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(info);
            }
        });
    });

};

module.exports = {
    sendVerificationEmail
};