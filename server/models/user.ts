import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUSER extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const userSchema: Schema<IUSER> = new Schema<IUSER>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    allocatedSpace: {
      type: Number,
      default: 104857600,
    },
    usedSpace: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      trim: true,
      minlength: [8, "Password must contain at least 8 characters."],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    resetCode: {
      type: String,
    },
    resetCodeExpiresAt: {
      type: Date,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpiresAt: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("folders", {
  ref: "Folder",
  foreignField: "user",
  localField: "_id",
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model<IUSER>("User", userSchema);
module.exports = User;
