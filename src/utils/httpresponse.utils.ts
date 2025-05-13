import {Response} from "express";

interface successResponse{
    message: string,
    success: boolean,
    data: any,
    paginationData?:any
}
export const handleSuccessResponse = <T>(res: Response, message: string, data: T, statusCode: number = 200 ,...extras: Array<any>) =>{
    const merge = Object.assign({}, ...extras)
    const response:successResponse = {
        message: message, success: true, data: data
    }

    if(extras.length > 0){
        response.paginationData = {...merge}
    }
    
    return res.status(statusCode).send(response)
}