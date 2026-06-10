const { Resend } = require("resend");
const ejs = require("ejs");
const path = require("path");



const resend = new Resend(process.env.RESEND_API_KEY);

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

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Verify Your Email",
        html
    });

};

module.exports = {
    sendVerificationEmail
};