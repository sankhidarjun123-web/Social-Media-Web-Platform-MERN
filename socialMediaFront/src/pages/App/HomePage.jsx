import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Post from "../../components/Post/Post";
import CreatePost from "../../components/Home/CreatePost";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../contexts/AuthContext";

const HomePage = () => {

    const [loading, setLoading] = useState(false);
    const [noMore, setNoMore] = useState(false);
    const [posts, setPosts] = useState([]);
    const [remove, setRemove] = useState([]);
    const [onPage, setOnPage] = useState(false);

    const SERVER = import.meta.env.VITE_SERVER_URL;     // Server URL from environment variables
    const loaderRef = useRef(null);
    const skipRef = useRef(0);

    useEffect(() => {
        document.title = "Feed | Vibeo";

        return () => {
            document.title = "Vibeo";
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchPosts();
                }
            },
            {
                rootMargin: "150px",
                threshold: 0
            }
        );

        const current = loaderRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, [loading, noMore, skipRef.current]);

    const fetchPosts = async () => {
        if (loading || noMore) return;

        setLoading(true);
        try {
            const res = await axios.get(
                `${SERVER}/userMedia/posts?limit=10&skip=${skipRef.current}`,
                { withCredentials: true }
            );

            const data = res.data;

            if (data.posts?.length > 0) {
                setPosts(prev => [...prev, ...data.posts]);
                setRemove(prev => [
                    ...prev,
                    ...new Array(data.posts.length).fill(false)
                ]);
                console.log("Fetched posts:", data.posts);
            }

            skipRef.current = data.nextSkip;
            setNoMore(data.noMorePosts);

        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CreatePost />

            {posts.map((post, i) => (
                remove[i] ? <div className="w-full">
                    <p className="text-center text-gray-500 py-4">Post removed</p>
                </div> : (
                    <Post key={i} onPage={onPage} post={post} number={i} setRemove={setRemove} />
                )
            ))}
            {/* LOADER */}
            <div ref={loaderRef} className="flex justify-center mt-6 sm:mt-8">

                {noMore ? (
                    <span className="text-gray-500 text-sm sm:text-base">
                        No more users
                    </span>
                ) : (
                    <Loader size={25} />
                )}

            </div>
        </>
    );
};

export default HomePage;