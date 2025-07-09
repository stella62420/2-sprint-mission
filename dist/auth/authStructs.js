"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenBodyStruct = exports.ChangePasswordBody = exports.LoginBodyStruct = exports.RegisterBodyStruct = void 0;
const superstruct_1 = require("superstruct");
exports.RegisterBodyStruct = (0, superstruct_1.object)({
    email: (0, superstruct_1.size)((0, superstruct_1.string)(), 5, 100),
    nickname: (0, superstruct_1.size)((0, superstruct_1.string)(), 2, 20),
    password: (0, superstruct_1.size)((0, superstruct_1.string)(), 8, 30),
});
exports.LoginBodyStruct = (0, superstruct_1.object)({
    email: (0, superstruct_1.size)((0, superstruct_1.string)(), 5, 100),
    password: (0, superstruct_1.size)((0, superstruct_1.string)(), 8, 30),
});
exports.ChangePasswordBody = (0, superstruct_1.object)({
    oldPassword: (0, superstruct_1.size)((0, superstruct_1.string)(), 8, 30),
    newPassword: (0, superstruct_1.size)((0, superstruct_1.string)(), 8, 30),
});
exports.RefreshTokenBodyStruct = (0, superstruct_1.object)({
    refreshToken: (0, superstruct_1.size)((0, superstruct_1.string)(), 10, 500),
});
