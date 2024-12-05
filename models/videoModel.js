import { Schema, model } from "mongoose";

const videoSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    embeddedLink: {
      type: String,
      required: true,
    },
    shareableLink: {
      type: String,
      required: true,
    },
    thumbnailURL: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Video", videoSchema);
