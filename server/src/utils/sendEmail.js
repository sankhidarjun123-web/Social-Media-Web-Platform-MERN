const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    getSocket: (options, callback) => {
        dns.resolve4("smtp.gmail.com", (err, addresses) => {
            if (err) return callback(err);

            const net = require("net");
            const socket = net.connect({
                host: addresses[0],
                port: 587
            });

            callback(null, {
                connection: socket
            });
        });
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