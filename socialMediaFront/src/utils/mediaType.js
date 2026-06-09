export const getMediaType = (url) => {

    const cleanUrl = url.split("?")[0];

    const extension = cleanUrl
        .split(".")
        .pop()
        ?.toLowerCase();

    const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg"
    ];

    const videoExtensions = [
        "mp4",
        "webm",
        "ogg",
        "mov"
    ];

    if (imageExtensions.includes(extension)) {
        return "image";
    }

    if (videoExtensions.includes(extension)) {
        return "video";
    }

    return "unknown";
};