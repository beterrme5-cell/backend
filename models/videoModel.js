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

    videoKey: {
      type: String,
    },
    duration: {
      type: String,
    },
    teaserKey: {
      type: String,
    },
    thumbnailKey: {
      type: String,
    },

    gifKey: {
      type: String,
    },
    eventProcessed: {
      type: Boolean,
      default: false, // means processing not completed yet
    },
  },
  { timestamps: true }
);

export default model("Video", videoSchema);
