import { HydratedDocument } from "mongoose";

export interface Chats {

    _id: string;
    participants: string[];
    latestMessage: string;
    encryptedChatKey: string;
    keyIV: string;
}