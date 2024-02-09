import { Response, Request, NextFunction } from "express"

// const catchAsync = (fn)=>{
//     return (req: Request,res: Response,next: NextFunction)=>{
//         fn(req, res,next).catch(next)
//     }
// }

const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};


module.exports = catchAsync

