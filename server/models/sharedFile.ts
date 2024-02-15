import mongoose, { Document, Schema } from "mongoose";
const user = require("./user");
const file = require("./file");

interface SHAREDFILETYPE extends Document {
  name: string;
  fileID: string;
  owner: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  recipient: mongoose.Schema.Types.ObjectId;
  recipientEmail: string;
  canRename: Boolean;
  canDownload: Boolean;
  canDelete: Boolean;
  ownerEmail: string;
}
const sharedFileShema: Schema<SHAREDFILETYPE> = new Schema<SHAREDFILETYPE>({
  name: {
    type: String,
  },
  fileID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: file,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
  },
  ownerEmail: {
    type: String,
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
  recipientEmail: {
    type: String,
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
