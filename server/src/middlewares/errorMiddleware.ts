import { Response, Request, NextFunction } from "express";




const errorMiddleware = async (err: any, req: Request, res: Response, next: NextFunction) => {


    const statusCode = err.statusCode || 500;


    res.status(statusCode).json({
        message: err.message || "Internal Server error"
    });
}

module.exports = errorMiddleware;