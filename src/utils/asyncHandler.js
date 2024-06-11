//these are the industry standard template for handling



export const asyncHandler = (asyncFunction) => {
  (req, res, next) =>
    Promise.resolve(asyncFunction(req, res, next)).catch((err) => next(err)); //next is part of middleware
};

// //other method
// const asyncHandler = (asyncFunction)=> async (req,res,next)=>{
//     try {
//         await asyncFunction(req,res,next)
//     } catch (error) {
//         res.status(error.code||500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }
