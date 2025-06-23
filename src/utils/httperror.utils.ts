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
    BadRequest: <T>(message: string, errors: T[] = []) => {
        return new HttpError(400, message, errors)
    },
    Unauthorized: <T>(message: string, errors: T[] = [])=>{
        return new HttpError(401, message, errors)
    },
    Forbidden: <T>(message: string, errors: T[] = [])=>{
        return new HttpError(403, message, errors)
    },
    NotFound: <T>(message: string, errors: T[] = [])=>{
        return new HttpError(404, message, errors)
    },
    InternalServerError: <T>(message: string, errors:T[] = [])=>{
        return new HttpError(500, message, errors)
    },
    BadGateway: <T>(message: string, errors: T[] = []) =>{
        return new HttpError(502, message, errors)
    },
    Custom: <T>(statusCode: number, message: string, errors: T[]=[])=>{
        return new HttpError(statusCode, message, errors)
    }
}

export default createHttpError