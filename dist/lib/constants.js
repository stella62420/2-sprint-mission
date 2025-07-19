"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_EXPIRES_IN = exports.REFRESH_TOKEN_SECRET = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.STATIC_PATH = exports.PUBLIC_PATH = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
exports.PORT = process.env.PORT || 3000;
exports.PUBLIC_PATH = '/public';
exports.STATIC_PATH = path_1.default.join(process.cwd(), 'public');
exports.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
exports.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
