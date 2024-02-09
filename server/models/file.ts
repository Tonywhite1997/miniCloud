import mongoose, { Document, Schema } from "mongoose";
const user = require("./user");
const folder = require("./folder");

interface IFILE extends Document {
  value: string;
  createdAt: Date;
}

const fileShema: Schema<IFILE> = new Schema<IFILE>({
  fileName: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  mimetype: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
    required: [true, "A folder requires a user"],
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: folder,
  },
});

const File = mongoose.model("File", fileShema);
module.exports = File;
