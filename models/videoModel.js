import { Schema, model } from "mongoose";

const videoSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    accountId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    embeddedLink: {
        type: String,
        required: true,
    },
    shareableLink: {
        type: String,
        required: true,
    },
},
    { timestamps: true }
);

export default model("Video", videoSchema);
