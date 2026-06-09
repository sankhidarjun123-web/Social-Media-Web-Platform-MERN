import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Comment from "./Comment";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import useComment from "../../hooks/useComment";
import Loader from "../ui/Loader";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { Plus } from "lucide-react";
import CommentInput from "./CommentInput";

const CommentBox = ({ post }) => {

    const SERVER = import.meta.env.VITE_SERVER_URL;
    const {
        text,
        setText,
        loadingPost,
        loadingGet,
        noMore,
        error,
        comments,
        fetchComments,
        postAComment
    } = useComment(post?._id);

    const [typed, setTyped] = useState(false);
    const { userData } = useAuth();

    useEffect(() => {

        if (text !== "") {
            setTyped(true);
        } else {
            setTyped(false);
        }
    }, [text]);


    useEffect(() => {

        fetchComments();
    }, []);



    return (
        <div className="w-full border-t border-gray-200 px-4 py-3 flex flex-col gap-3">

            <CommentInput post={post} userData={userData} text={text} setText={setText} typed={typed} setTyped={setTyped} loadingPost={loadingPost} postAComment={postAComment} parentComment={null} />
            {/* Dummy Comments */}
            <section className="w-full">
                {comments.map((comment, indx) => (
                    <Comment key={indx} comment={comment} aChildComment={false} depth={0} />
                ))}
                {loadingGet && <div className="w-full flex justify-center items-center">
                    <Loader size={16} />
                </div>}

                {(!noMore && !loadingGet) &&
                    <div className="w-full flex justify-center items-center">
                        <button
                            onClick={() => fetchComments()}
                            type="button"
                            className="hover-btn-prop w-8 h-8">
                            <Plus />
                        </button>
                    </div>}

                {noMore && <div className="w-full flex justify-center items-center">
                    <span className="text-gray-500 text-sm sm:text-base">No more comments</span>
                </div>}
            </section>


        </div>
    );
}


export default CommentBox;