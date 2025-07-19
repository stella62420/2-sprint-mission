"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const superstruct_1 = require("superstruct");
const BadRequestError_1 = __importDefault(require("../lib/errors/BadRequestError"));
function validate(type, schema) {
    return function (req, res, next) {
        try {
            req[type] = (0, superstruct_1.create)(req[type], schema);
            next();
        }
        catch (err) {
            if (err instanceof superstruct_1.StructError) {
                const messages = err.failures().map(failure => {
                    return `${failure.path.join('.')} is ${failure.message}`;
                }).join(', ');
                return next(new BadRequestError_1.default(`Validation error: ${messages}`));
            }
            next(err);
        }
    };
}
