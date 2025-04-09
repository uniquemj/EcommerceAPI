class HttpError extends Error{
    public statusCode:number
    public errors: any

    constructor(statusCode:number, message: string, errors: any){
        super(message)
        this.statusCode = statusCode
        this.errors = errors
        Object.setPrototypeOf(this, HttpError.prototype)
    }
}

const createHttpError = {
    BadRequest: (message: string, errors: any = []) => {
        return new HttpError(400, message, errors)
    },
    Unauthorized: (message: string, errors: any = [])=>{
        return new HttpError(401, message, errors)
    },
    Forbidden: (message: string, errors: any =[])=>{
        return new HttpError(403, message, errors)
    },
    NotFound: (message: string, errors: any=[])=>{
        return new HttpError(404, message, errors)
    },
    InternalServerError: (message: string, errors:any=[])=>{
        return new HttpError(500, message, errors)
    },
    Custom:(statuscode: number, message: string, errors: any=[])=>{
        return new HttpError(statuscode, message, errors)
    }
}

export default createHttpError