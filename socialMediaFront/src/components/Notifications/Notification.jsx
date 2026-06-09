import { useState, useEffect, useRef } from "react";
import { user as userImg } from "../../assets/allImgs";
import axios from "axios";

/**
 * Notification
 *
 * Props:
 *   notification {
 *     receiver:    string
 *     sender:      string
 *     type:        string
 *     link:        string
 *     mainMessage: string
 *     image?:      string
 *     notMessage?: string
 *   }
 */

const Notification = ({ notification }) => {
    if (!notification) return null;

    const SERVER = import.meta.env.VITE_SERVER_URL;

    const notificationRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            async ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !notification.isRead
                ) {
                    try {
                        await axios.patch(
                            `${SERVER}/notifications/seen/${notification._id}`, {
                            }, {
                                withCredentials: true
                            }
                        );

                        observer.disconnect();
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
            {
                threshold: 0.5
            }
        );

        if (notificationRef.current) {
            observer.observe(notificationRef.current);
        }

        return () => observer.disconnect();
    }, [notification]);

    const { link, mainMessage, image, notMessage } = notification;

    return (
        <div ref={notificationRef} className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl ${!notification.isRead
            ? "bg-yellow-50 hover:bg-yellow-100"
            : "hover:bg-slate-50"} transition-colors duration-150 group cursor-pointer border border-transparent hover:border-slate-100`}>

            {/* Image — only rendered when provided */}
            <div className="shrink-0 mt-0.5">
                <img
                    src={image || userImg}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                />
            </div>

            {/* Text block */}
            <div className={`flex flex-col gap-0.5 min-w-0 ${!image ? "w-full" : ""}`}>

                {/* Link — small, muted, truncated */}
                {link && (
                    <span className="text-[10px] font-medium text-slate-400 truncate tracking-wide uppercase">
                        {link}
                    </span>
                )}

                {/* Main message + optional notMessage */}
                <p className={`text-sm leading-snug break-words ${!image ? "text-base" : ""}`}>
                    <span className="font-semibold text-slate-800">
                        {mainMessage}
                    </span>
                    {notMessage && (
                        <>
                            <span className="text-slate-400 font-normal">: </span>
                            <span className="text-slate-500 font-normal">
                                {notMessage}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Notification;