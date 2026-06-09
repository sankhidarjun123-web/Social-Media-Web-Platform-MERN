import React from 'react';
import { threeDotVertical } from '../../assets/allImgs';
import Dropdown from '../ui/DropDown';




function PostCard({ contentInfo, className, inh }) {

    const options = [
        { label: "remove", onClick: console.log("remove") }
    ];

    return (
        <div className={`w-[95%] h-[150px] ${!inh && "bg-zinc-50"} ${className} flex items-center gap-2`}>

            {contentInfo.type !== "text" && <img src={contentInfo.type === "image" ? contentInfo.images[0] : contentInfo.thumbnail}
                className='w-[170px] h-[90%] rounded'
                alt="post-img" />}

            <div className={`${contentInfo.type === "text" ? "w-[90%]" : "w-[70%]"} grid`}
                style={{
                    gridTemplateAreas: `
                    "text text text"
                    "user user user"
                    "postedAt likes comments"
                    `,
                    gridTemplateColumns: "1fr 1fr 1fr"
                }}>
                <div className='w-full h-full clamp-2 p-2' style={{ gridArea: "text" }}>
                    {contentInfo.text}
                </div>

                <div className='w-full h-full p-2 flex items-center' style={{ gridArea: "user" }}>

                </div>

                {!inh && (<><div className='w-full h-full p-2' style={{ gridArea: "postedAt" }}>
                    posted at : 24 feb 2023
                </div>

                <div className='w-full h-full p-2 text-end' style={{ gridArea: "likes" }}>
                    24 likes
                </div>

                <div className='w-full h-full p-2' style={{ gridArea: "comments" }}>
                    2 comments
                </div></>)}
            </div>

            {!inh && <Dropdown options={options}>
                <button className='hover-btn-prop w-8 h-8'><img src={threeDotVertical} alt="options" /></button>
            </Dropdown>}
        </ div>
    )
}


export default PostCard;