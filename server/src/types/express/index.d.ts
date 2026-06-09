import "express";

declare global {
    namespace Express {
        interface Request {
            user?: any;
            chat?: any;
            files?: any;
            file?: any;
            allowConnections?: boolean;
            allowChats?: boolean;
            channelVisibility?: string;
            channelContentVisibility?: string;
            receiverId?: string;
        }
    }
}

export {};