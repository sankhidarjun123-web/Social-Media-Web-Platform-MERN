import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath as string);

const generateThumbnail = (
    videoPath: string,
    filename: string
): Promise<string> => {

    return new Promise((resolve, reject) => {

        const thumbnailPath = path.join(
            "uploads/thumbnails",
            `${filename}.png`
        );

        ffmpeg(videoPath)
            .screenshots({
                timestamps: ["1"],
                filename: `${filename}.png`,
                folder: "uploads/thumbnails",
                size: "720x?"
            })

            .on("end", () => {
                resolve(thumbnailPath);
            })

            .on("error", (err) => {
                reject(err);
            });
    });
};

export default generateThumbnail;