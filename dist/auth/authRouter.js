"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const withAsync_1 = require("../lib/withAsync");
const authController_1 = require("../auth/authController");
const validation_1 = require("../middleware/validation");
const authStructs_1 = require("../auth/authStructs");
const authRouter = express_1.default.Router();
authRouter.post('/register', (0, validation_1.validate)('body', authStructs_1.RegisterBodyStruct), (0, withAsync_1.withAsync)(authController_1.register));
authRouter.post('/login', (0, validation_1.validate)('body', authStructs_1.LoginBodyStruct), (0, withAsync_1.withAsync)(authController_1.login));
authRouter.post('/refresh', (0, withAsync_1.withAsync)(authController_1.refreshAccessToken));
exports.default = authRouter;
