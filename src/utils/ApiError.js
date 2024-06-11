export class ApiError extends Error {
    constructor(statusCode,message= "Something went wrong",errors =[],stack){
        //without message passing it would work same but better practice is passing message
       super(message)
       this.message = message
       this.statusCode = statusCode
       this.errors = errors

       this.success = false //error is there how success can be true

       if(stack){
        this.stack = stack
       }
       else{
        Error.captureStackTrace(this,this.constructor)
       }

    }
}