import PostPage from "../../pages/Post/PostPage"
import { useNavigate } from "react-router-dom"


function ExploreItems({ style, image, post }) {

    const navigate = useNavigate();


    return <div className={` w-full h-[100px] sm:h-[200px] rounded overflow-hidden`}
    style={{...style}}>
        <img src={image} className="w-full h-full" onClick={() => {
            navigate("/post", {
                state: {
                    post
                }
            });
        }}/>
    </div>
}

export default ExploreItems;