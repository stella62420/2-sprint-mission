"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const withAsync_1 = require("../lib/withAsync");
const commentsController_1 = require("../comments/commentsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const commentsStruct_1 = require("../comments/commentsStruct");
const commonStructs_1 = require("../lib/commonStructs");
const commentsRouter = express_1.default.Router();
commentsRouter.patch('/:id', auth_1.authenticateUser, (0, validation_1.validate)('params', commonStructs_1.IdParamsStruct), (0, validation_1.validate)('body', commentsStruct_1.UpdateCommentBodyStruct), (0, withAsync_1.withAsync)(commentsController_1.updateComment));
commentsRouter.delete('/:id', auth_1.authenticateUser, (0, validation_1.validate)('params', commonStructs_1.IdParamsStruct), (0, withAsync_1.withAsync)(commentsController_1.deleteComment));
exports.default = commentsRouter;
