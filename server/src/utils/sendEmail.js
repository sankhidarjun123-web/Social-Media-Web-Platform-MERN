const SibApiV3Sdk = require("sib-api-v3-sdk");
const ejs = require("ejs");
const path = require("path");

const client = SibApiV3Sdk.ApiClient.instance;

client.authentications["api-key"].apiKey =
    process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendVerificationEmail = async (
    email,
    verificationLink
) => {

    console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);
    console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY?.slice(0, 10));
    const html = await ejs.renderFile(
        path.join(process.cwd(), "views", "verification.ejs"),
        {
            verificationLink,
            expiryTime: "24 hours"
        }
    );

    try {
        const result = await emailApi.sendTransacEmail({
            sender: {
                email: "sankhidarjun123@gmail.com",
                name: "Vibeo"
            },
            to: [
                {
                    email
                }
            ],
            subject: "Verify Your Email",
            htmlContent: html
        });

        console.log("EMAIL SENT:", result);
    } catch (err) {
        console.error("BREVO ERROR:", err);
        throw err;
    }
};

module.exports = {
    sendVerificationEmail
};