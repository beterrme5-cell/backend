import { Schema, model } from "mongoose";
import { randomBytes, createHmac } from "crypto";
import { generateToken } from "../services/auth.js";

const userSchema = new Schema(
  {
    accountId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    salt: {
      type: String,
    },
  },
  { timestamps: true }
);

// Runs before saving the user to the database
userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
  next();
});

// Static method to match password and generate token
userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found!");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash)
      throw new Error("Incorrect Password!");
    // Create token for user and saves it to the cookies of user
    const accessToken = generateToken(user);
    return {
      user,
      accessToken,
    };
  }
);

export default model("User", userSchema);
