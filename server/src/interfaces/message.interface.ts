type MediaType = {
    public_id: string,
    url: string,
    type: "image" | "video",
}

export default interface Message {
    _id: string;
    chat: string;
    sender: string | any;
    contentType: "text" | "image" | "video";
    encryptedMessage: string;
    iv: string;
    authTag: string;
    media?: MediaType | null;
    isSend?: boolean;
}