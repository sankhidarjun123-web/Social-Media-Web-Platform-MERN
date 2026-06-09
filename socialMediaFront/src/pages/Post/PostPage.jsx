import { useState, useEffect, useRef } from 'react';
import Post from "../../components/Post/Post";
import axios from 'axios';
import Loader from '../../components/ui/Loader';

import { useLocation, useParams } from 'react-router-dom';


function PostPage() {

    const SERVER = import.meta.env.VITE_SERVER_URL;
    const location = useLocation();
    const postId = useParams().postId;

    const [post, setPost] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [onPage, setOnPage] = useState(true);
    const videoRef = useRef();

    useEffect(() => {
        document.title = post ? `${post?.text?.words?.substring(0, 20)}...` : "Post";

        return () => {
          document.title = "Vibeo";
        }
      }, []);

    useEffect(() => {

        setLoading(true);
        axios.get(`${SERVER}/userMedia/posts/${postId}`, {
            withCredentials: true
        })
            .then((response) => {
                console.log("Post data fetched successfully:", response.data);
                setPost(response.data.post);
            })
            .catch((error) => {
                console.error("Error fetching post:", error);
                if(error.response && error.response.status === 404) {
                    setError("Post not found");
                } else if (error.response && error.response.status === 403) {
                    setError("This post is private");
                } else {
                    setError("Error fetching post");
                }
            })
            .finally(() => {
                setLoading(false);
            })

    }, [postId, location.state]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            const video = videoRef.current;
            if (!video) return;
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea") return;

            switch (e.key) {

                case "F":
                case "f":
                    if (!document.fullscreenElement) {
                        video.requestFullscreen?.() ||
                            video.webkitRequestFullscreen?.() ||
                            video.msRequestFullscreen?.();
                    } else {
                        document.exitFullscreen?.() ||
                            document.webkitExitFullscreen?.() ||
                            document.msExitFullscreen?.();
                    }
                    break;

                case "ArrowLeft":
                case "j":
                    e.preventDefault();   // stop page scroll
                    if (!isNaN(video.duration)) {
                        video.currentTime = Math.max(video.currentTime - 5, 0);
                    }
                    break;

                case "ArrowRight":
                case "l":
                    e.preventDefault();
                    if (!isNaN(video.duration)) {
                        video.currentTime = Math.min(
                            video.currentTime + 5,
                            video.duration
                        );
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () =>
            window.removeEventListener("keydown", handleKeyPress);

    }, []);

    return (
        <div className="w-full min-h-screen sm:w-[750px] sm:w-[90%] sm:rounded-lg border-none">
            {loading ? (
                <div className="w-full flex items-center justify-center">
                    <Loader size={20} />
                </div>
            ) : error ? (
                <p className="flex justify-center text-red-500">{error}</p>
            ) : (
                <Post onPage={onPage} post={post} />
            )}
        </div>
    );
}

export default PostPage;