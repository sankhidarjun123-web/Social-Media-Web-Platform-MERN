import { sceneA, sceneB, sceneC, profileManA ,fashionA, fashionB, fashionC, fashionD } from "./allImgs";
import republic from "./post/Republic.mp4"
const contentInfo = {
    type: "text",
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
}

const contentInfoII = {
    type: "text",
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
}

const contentInfoIII = {
    type: "image",
    images: [sceneA, sceneB, sceneC],
    text: "Had a very fun experience here!"
}

const contentInfoIV = {
    type: "image",
    images: [fashionA, fashionB, fashionC, fashionD],
    text: "Fashion is not just about wearing clothes—it’s about wearing confidence. Every outfit tells a story, from subtle neutrals to bold statements, blending comfort, attitude, and individuality. Style is personal, timeless, and powerful when it truly reflects who you are. Dress the way you feel, and let your vibe speak louder than words./n #FashionStyle #OutfitInspo #ModernFashion #StreetStyle #StyleStatement #ConfidenceWear #EverydayFashion #WearYourVibe #MinimalAesthetic #TrendWithPurpose/nMentions(optional):@fashiondaily @streetstyleofficial @styleinspo @modernwear"
}

const contenetInfoV = {
    type: "image",
    images: [profileManA, sceneA, sceneB, fashionA, fashionB, fashionC, sceneB],
    text: "Nice doing it!"
}

const contentInfoVI = {
    type: "image",
    images: [fashionA],
    text: "Hey! Cutie"
}

const contenetInfoVII = {
    type: "video",
    video: republic,
    text: "Hey! Siderman fans!",
    thumbnail: fashionD
}

const contentInfoVIII = {
    type: "video",
    video: "/assets/post/Spiderman.mkv",
    text: "Greater the power the greater are the responsibilities, remember kids, what is right and what is wrong",
    thumbnail: fashionA
}

export { contentInfo, contentInfoII, contentInfoIII, contentInfoIV, contenetInfoV, contentInfoVI, contenetInfoVII, contentInfoVIII };