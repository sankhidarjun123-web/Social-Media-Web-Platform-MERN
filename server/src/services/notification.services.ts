const Notifications =
    require("../models/Notification.model");

const Users =
    require("../models/Users.model");

const notificationSocket =
    require("../socket/notificationSocket");

interface NotificationData {
    receiver: string[];
    sender: string;
    type: "like" | "post" | "comment" | "reply" | "follow" | "connection_request" | "connection_accept";
    link: string;
    mainMessage: string;
    image?: string;
    notMessage?: string;
}

const sendNotification = async ({
    receiver,
    sender,
    type,
    link,
    mainMessage,
    image,
    notMessage
}: NotificationData) => {

    try {

        const receiverData = await Users.find({
            _id: { $in: receiver },
            allowNotifications: true
        })
            .select("_id")
            .lean();

        const receiverSet = new Set(
            receiverData.map((r: any) => r._id.toString())
        );

        const allowedReceiver = receiver.filter((id) =>
            receiverSet.has(id.toString())
        );

        if (allowedReceiver.length === 0) {
            return null;
        }
        // create notification in database
        const notification =
            await Notifications.create({
                receiver,
                sender,
                type,
                link,
                mainMessage,
                image,
                notMessage
            });

        // realtime socket emit
        console.log(receiver);
        notificationSocket(
            receiver,
            notification
        );

        return notification;
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    sendNotification
};