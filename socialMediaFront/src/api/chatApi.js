import axios from "axios";

const SERVER = import.meta.env.VITE_SERVER_URL;

const api = axios.create({
    baseURL: `${SERVER}/chats`,
    withCredentials: true
});

const sendMessage = async (
    text,
    media = null,
    receiverId = null,
    chatId = null
) => {

    try {

        const formData = new FormData();

        // Append text
        formData.append("text", text);

        // Append media only if exists
        if (media && media.file) {
            formData.append("media", media.file);
        }

        let response;

        // New chat
        if (!chatId) {

            formData.append("receiverId", receiverId);

            response = await api.post(
                "/send",
                formData
            );

        }

        // Existing chat
        else {

            response = await api.post(
                `/${chatId}/send`,
                formData
            );
        }

        return response.data;

    } catch (err) {

        console.error(err);

        return {
            success: false,
            message:
                err?.response?.data?.message ||
                "Failed to send message"
        };
    }
};

const getChat = async (chatId) => {

    const response = await api.get(`/user-data/${chatId}`);

    return response;
}


const getUserChats = async (user, skip, limit = 10) => {

    const response = await api.get(`/allChats?limit=${limit}&skip=${skip}`);

    return response;
}

const getChatMessages = async (chatId, skip, limit = 10) => {

    const response = await api.get(`/${chatId}?limit=${limit}&skip=${skip}`);

    return response;
}

const deleteAMessage = async (chatId, messageId) => {

    console.log(chatId, messageId);
    const response = await api.delete(`/${chatId}/message/${messageId}`);

    return response.data;
}


const deleteChat = async (chatId) => {

    const response = await api.delete(`/${chatId}`);

    return response.data;
}



export { getChat, sendMessage, getChatMessages, getUserChats, deleteAMessage, deleteChat };