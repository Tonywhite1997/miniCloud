import {Request,Response,NextFunction} from "express"
const User = require("../models/user")
const appError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.updateUsedSpace = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const{fileSize} = req.body 
    const{usedSpace} = req.user
    if(!fileSize)return next(new appError("file size required", 400))
    const updatedUsedSpace = usedSpace + fileSize
    const user = await User.findByIdAndUpdate(req.user._id, {usedSpace: updatedUsedSpace}, {new:true})
    res.status(200).json({
        status:"ok",
        user
    })
})

exports.updateUsedSpace = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { fileSize, operation } = req.body;
    const { usedSpace } = req.user;

    if (!fileSize || !operation) {
        return next(new appError("file size and operation required", 400));
    }

    let updatedUsedSpace:number;
    if (operation === 'add') {
        updatedUsedSpace = usedSpace + fileSize;
    } else if (operation === 'delete') {
        updatedUsedSpace = usedSpace - fileSize;
    } else {
        return next(new appError("Invalid operation. Supported operations are 'add' and 'delete'.", 400));
    }

    if (updatedUsedSpace < 0) {
        return next(new appError("Invalid operation. Used space cannot be negative.", 400));
    }

    const user = await User.findByIdAndUpdate(req.user._id, { usedSpace: updatedUsedSpace }, { new: true });

    res.status(200).json({
        status: "ok",
        user
    });
});
