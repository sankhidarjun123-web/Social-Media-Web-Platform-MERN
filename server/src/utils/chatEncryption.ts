const crypto = require("crypto");


const algorithm = "aes-256-gcm";


const MASTER_KEY = crypto
    .createHash("sha256")
    .update(process.env.MASTER_KEY as string)
    .digest();

export type EncryptedChatKey = {
    encryptedKey: string;
    iv: string;
};

export type EncryptedMessage = {
    encryptedMessageText: string;
    iv: string;
    authTag: string;
}

// chat key generator
const encryptChatKey = (chatKey: string): EncryptedChatKey => {


    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-cbc", MASTER_KEY, iv);

    let encrypted = cipher.update(chatKey, "utf-8", "hex");

    encrypted += cipher.final("hex");

    return {
        encryptedKey: encrypted,
        iv: iv.toString("hex")
    };
}

// chat key decrypter
const decryptChatKey = (encryptedChatKey: string, ivHex: string): string => {

    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", MASTER_KEY, iv);

    let decrypted = decipher.update(encryptedChatKey, "hex", "utf-8");

    decrypted += decipher.final("utf-8");

    return decrypted;
}

// message encrypter
const encryptMessage = (message: string, chatKey: string): EncryptedMessage => {

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, Buffer.from(chatKey, "hex"), iv);

    let encrypted = cipher.update(message, "utf-8", "hex");

    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
        encryptedMessageText: encrypted,
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex")
    }
}

// message decrypter
const decryptMessage = (encryptedMessage: string, ivHex: string, authTagHex: string, chatKey: string): string => {

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(chatKey, "hex"), Buffer.from(ivHex, "hex"));

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encryptedMessage, "hex", "utf-8");

    decrypted += decipher.final("utf-8");


    return decrypted;
}


module.exports = {
    encryptChatKey,
    decryptChatKey,
    encryptMessage,
    decryptMessage
}