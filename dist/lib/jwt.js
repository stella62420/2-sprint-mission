"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.decodeToken = decodeToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("./constants");
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, constants_1.JWT_SECRET, {
        expiresIn: constants_1.JWT_EXPIRES_IN,
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, constants_1.REFRESH_TOKEN_SECRET, {
        expiresIn: constants_1.REFRESH_TOKEN_EXPIRES_IN,
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, constants_1.REFRESH_TOKEN_SECRET);
}
function decodeToken(token) {
    return jsonwebtoken_1.default.decode(token);
}
