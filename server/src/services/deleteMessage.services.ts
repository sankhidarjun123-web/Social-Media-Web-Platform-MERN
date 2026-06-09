const Messages = require("../models/Messages.model");
const { deleteFromGCSSecure } = require("../utils/gcsServices");
import AppError from "../utils/AppError";



const messageDeleter = async (messageId: string | null, chatId: string): Promise<void> => {

    try {
        if (messageId) {
            const message = await Messages.findById(messageId);

            if (!message) {
                throw new AppError("Message not found", 404);
            }
            if (message.contentType !== "text") {
                await deleteFromGCSSecure(message?.media?.public_id, message?.media?.type);
            }
            await Messages.deleteOne({ _id: messageId, chat: chatId });
            return;
        }

        if (chatId) {

            const messages = await Messages.find({
                chat: chatId
            });

            for (const message of messages) {

                if (
                    message.contentType !== "text"
                ) {
                    await deleteFromGCSSecure(
                        message.media.public_id,
                        message.media.type
                    );
                }

                await Messages.deleteMany({
                    chat: chatId
                });

                return;
            }
        }

        throw new AppError("Message Id or Chat Id is required", 400);
    } catch (err) {
        console.error(err);
        throw err;
    }
}


export default messageDeleter;