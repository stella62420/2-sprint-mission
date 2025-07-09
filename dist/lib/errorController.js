"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.defaultNotFoundHandler = defaultNotFoundHandler;
const BadRequestError_1 = __importDefault(require("./errors/BadRequestError"));
const NotFoundError_1 = __importDefault(require("./errors/NotFoundError"));
function errorHandler(err, req, res, next) {
    console.error(err);
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (err instanceof BadRequestError_1.default) {
        statusCode = 400;
        message = err.message;
    }
    else if (err instanceof NotFoundError_1.default) {
        statusCode = 404;
        message = err.message;
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    else if (err.statusCode && err.message) {
        statusCode = err.statusCode;
        message = err.message;
    }
    res.status(statusCode).json({
        error: message,
    });
}
function defaultNotFoundHandler(req, res) {
    res.status(404).json({ message: 'Not Found' });
}
