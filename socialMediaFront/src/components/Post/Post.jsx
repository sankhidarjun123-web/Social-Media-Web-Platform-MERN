import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { user } from "../../assets/allImgs";
import useViewTracker from "../../hooks/useViewTracker";
import { useAuth } from "../../contexts/AuthContext";


import PostHeader from "../../features/Post/PostHeader";
import PostContent from "../../features/Post/PostContent";
import PostFooter from "../../features/Post/PostFooter";
import CommentBox from "../Comments/CommentBox";



function Post({ post, onPage, number, setRemove, setDeleted }) {

    const [openComments, setOpenComments] = useState(false);
    const viewRef = useViewTracker(post._id);
    const { userData } = useAuth();


    return (
        <div ref={viewRef} className={`w-full sm:w-[750px] bg-zinc-50 ${!openComments && 'sm:rounded-lg'} border-none shadow-sm`}>
            <PostHeader post={post} onPage={onPage} number={number} setRemove={setRemove} setDeleted={setDeleted} />
            <PostContent post={post} />
            <PostFooter post={post} openComments={openComments} setOpenComments={setOpenComments} />

            {
                openComments && <CommentBox post={post} />
            }
        </div>
    );
}


export default Post;