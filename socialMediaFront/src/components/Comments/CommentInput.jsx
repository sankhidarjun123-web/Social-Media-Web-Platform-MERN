import { user } from "../../assets/allImgs";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";




const CommentInput = ({ post, userData, text, setText, typed, setTyped, loadingPost, postAComment, parentComment }) => {



    return (<div>
        {/* Input + Buttons */}
        < div className="flex flex-col w-full gap-2" >

            <Link to={`/channel/${post?.postedBy?.channel}`} className="flex items-center gap-3">
                <img
                    src={userData?.profileImg || user}
                    alt={"user"} className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700">
                    {userData?.firstname} {userData?.lastname ? userData?.lastname : ""}
                </span>
            </Link>

            <input
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && text.length > 0) {
                        postAComment(parentComment);
                    }
                }}
                value={text}
                type="text"
                placeholder="Write a comment..."
                className="w-full bg-zinc-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2">

                <button
                    className="px-3 py-1.5 text-sm cursor-pointer text-gray-600 hover:text-black transition"
                    onClick={() => setText("")}
                >
                    Cancel
                </button>

                <button
                    onClick={() => postAComment(parentComment)}
                    disabled={!typed || loadingPost} className={`${(typed && !loadingPost) ? "btn-gradient text-white" : "not-allowed-button"} px-4 py-1.5 rounded-lg text-sm font-medium`}>
                    {loadingPost ? "Posting..." : "Post"}
                </button>

            </div>

        </div >
    </div>);

}


export default CommentInput;