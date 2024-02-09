import mongoose, {Document, Schema} from "mongoose"

interface IFOLDER extends Document{
    name:string,
    createdAt: Date,
    folder: [string]
}

const folderSchema: Schema<IFOLDER> = new Schema<IFOLDER>({
    name:{
        type:String,
        minlength:[2, "Folder name must be at least 2 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A folder requires a user"]
    }
})

const Folder = mongoose.model("Folder", folderSchema)
module.exports = Folder