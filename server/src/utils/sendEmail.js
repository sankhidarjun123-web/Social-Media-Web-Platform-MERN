const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "142.250.4.108",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    },
    tls: {
        servername: "smtp.gmail.com"
    }
});

const sendVerificationEmail = async (
    email,
    verificationLink
) => {

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