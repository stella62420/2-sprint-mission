"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordBodyStruct = exports.UpdateUserBodyStruct = void 0;
const superstruct_1 = require("superstruct");
exports.UpdateUserBodyStruct = (0, superstruct_1.partial)((0, superstruct_1.object)({
    nickname: (0, superstruct_1.size)((0, superstruct_1.nonempty)((0, superstruct_1.string)()), 2, 20),
    image: (0, superstruct_1.nonempty)((0, superstruct_1.string)()),
}));
exports.ChangePasswordBodyStruct = (0, superstruct_1.object)({
    currentPassword: (0, superstruct_1.nonempty)((0, superstruct_1.string)()),
    newPassword: (0, superstruct_1.size)((0, superstruct_1.nonempty)((0, superstruct_1.string)()), 8, 30),
});
