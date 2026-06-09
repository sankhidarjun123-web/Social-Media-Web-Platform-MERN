import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Post from "../../components/Post/Post";
import People from "../../components/Profile/People";
import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
import Loader from "../../components/ui/Loader";
import { getSearchResults, addSearchedUsers } from "../../api/searchApi";


const chunkArray = (arr, size) => {
    const chunks = [];

    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }

    return chunks;
};


const SearchAll = () => {

    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [skip, setSkip] = useState(0);
    const [noMore, setNoMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const postChunks = useMemo(() => chunkArray(posts, 5), [posts]);
    const userChunks = useMemo(() => chunkArray(users, 5), [users]);

    const maxChunks = Math.max(postChunks.length, userChunks.length);


    const [searchParams] = useSearchParams();
    const keywords = searchParams.get("keywords");
    const loadingRef = useRef(false);
    const observer = useRef(null);


    const fetchAll = async () => {
        if (noMore || loadingRef.current || loading) return;
        loadingRef.current = true;
        setLoading(true);
        try {

            const data = await getSearchResults(keywords, 10, skip, "all");

            setPosts(prev => [...prev, ...data.posts]);
            setUsers(prev => [...prev, ...data.users]);
            setSkip(data.nextSkip || 0);
            setNoMore(data.noMorePosts);
            if (data.posts.length === 0) setNoMore(true);

        } catch (err) {
            console.error(err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!keywords) return;

        setPosts([]);
        setUsers([]);
        setSkip(0);
        setNoMore(false);

        fetchAll();
    }, [keywords]);

    const lastPostRef = useCallback((node) => {

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {

            if (entries[0].isIntersecting) {
                fetchAll();
            }

        });

        if (node) observer.current.observe(node);

    }, [skip, noMore]);

    return (
        <div className="flex flex-col gap-6 py-8 max-sm:w-screen">

            {Array.from({ length: maxChunks }).map((_, chunkIndex) => {

                const currentPosts = postChunks[chunkIndex] || [];
                const currentUsers = userChunks[chunkIndex] || [];

                return (
                    <div key={chunkIndex} className="flex flex-col gap-6">

                        {/* POSTS */}
                        <div className="flex flex-col gap-3 items-center">
                            {currentPosts.map((post, i) => {

                                const globalPostIndex = chunkIndex * 5 + i;
                                const isLastPost = globalPostIndex === posts.length - 1;

                                if (isLastPost) {
                                    return (
                                        <div ref={lastPostRef} key={post._id}>
                                            <Post
                                                post={post}
                                                onPage={true}
                                                number={globalPostIndex}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <Post
                                        key={post._id}
                                        post={post}
                                        onPage={false}
                                        number={globalPostIndex}
                                    />
                                );
                            })}
                        </div>

                        {/* PEOPLE */}
                        {currentUsers.length > 0 && (
                            <div className="overflow-visible">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-3">
                                    {currentUsers.map(user => (
                                        <div onClick={() => addSearchedUsers(user._id)}>
                                            <People
                                                key={user._id}
                                                detail={user}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {loading && (
                <div className="flex justify-center items-center w-full">
                    <Loader size={16} />
                </div>
            )}

            {noMore && (
                <p className="w-full flex items-center justify-center text-sm font-light">
                    No more data
                </p>
            )}
        </div>

    );
}

export default SearchAll;