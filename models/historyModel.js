import { Schema, model } from "mongoose";

const historySchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    contactName: {
        type: String,
        required: true,
    },
    sendType: {
        type: String,
        enum: ["email", "sms"],
        required: true,
    },
    subject: {
        type: String,
    },
    status: {
        type: String,
        enum: ["sent", "failed"],
        required: true,
    },
},
    { timestamps: true }
);

export default model("History", historySchema);
