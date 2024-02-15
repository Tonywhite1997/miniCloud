import mongoose, { Document, Schema } from "mongoose";
const user = require("./user");

interface SHAREDFILETYPE extends Document {
  name: string;
  fileID: string;
  owner: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  recipient: mongoose.Schema.Types.ObjectId;
  canRename: Boolean;
  canDownload: Boolean;
  canDelete: Boolean;
}
const sharedFileShema: Schema<SHAREDFILETYPE> = new Schema<SHAREDFILETYPE>({
  name: {
    type: String,
  },
  fileID: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: user,
  },
  canRename: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
  canDownload: {
    type: Boolean,
    default: false,
  },
});

const SharedFile = mongoose.model("SharedFile", sharedFileShema);
module.exports = SharedFile;
