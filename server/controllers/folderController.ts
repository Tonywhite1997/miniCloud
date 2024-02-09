import {Request, Response, NextFunction, request} from "express"
const Folder = require("../models/folder")
const User = require("../models/user")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.createFolder = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{  
    
    const {name} = req.body
    
    if(!name) return next(new AppError("Give your folder a name", 402))

    const checkIfFolderExists = await Folder.find({name:name, user: req.user._id})
    
    if(checkIfFolderExists.length) return next(new AppError("Folder already exists", 401))
    
    const {id} = req.user
    const user = await User.findById(id)
    await Folder.create({name, user:user._id})

    const folders = await Folder.find({user:req.user._id})

    res.status(200).json({
        status:"ok",
        folders
    })
    
})

exports.getMyFolders = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const {id} = req.user
    
    const myFolders = await Folder.find({user: id})
    res.status(200).json({
        status:"ok",
        myFolders
    })
})

exports.getFolders = catchAsync(async(req:Request, ress:Response,next:NextFunction)=>{
    const allFolders = await Folder.find({user:req.user._id})
    ress.status(200).json({
        status:"ok",
        data: allFolders
    })
})

exports.deleteFolder = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
    const{folderId} = req.params
    await Folder.deleteOne({_id:folderId})
    const folders = await Folder.find({user:req.user._id})
    res.status(200).json({
        status:"ok",
        folders
    })
})
exports.renameFolder = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
    const{folderId} = req.params
    const {name} = req.body

    if(!name) return next(new AppError("Give your folder a new name", 402))

    const checkIfFolderExists = await Folder.find({name:name, user: req.user._id})
    
    if(checkIfFolderExists.length) return next(new AppError("Folder already exists", 401))

    const result = await Folder.updateOne({_id: folderId}, {$set:{name}})

    
    if(!result.nModified) return next(new AppError("Error renaming folder. Try again", 404))

    const folders = await Folder.find({user:req.user._id})
    res.status(200).json({
        status:"ok",
        folders
    })
})