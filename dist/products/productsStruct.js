"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductBodyStruct = exports.GetProductListParamsStruct = exports.ProductRegisterBody = exports.CreateProductBodyStruct = void 0;
const superstruct_1 = require("superstruct");
const commonStructs_1 = require("../lib/commonStructs");
exports.CreateProductBodyStruct = (0, superstruct_1.object)({
    title: (0, superstruct_1.string)(),
    description: (0, superstruct_1.string)(),
    price: (0, superstruct_1.number)(),
    category: (0, superstruct_1.optional)((0, superstruct_1.string)()),
    images: (0, superstruct_1.optional)((0, superstruct_1.array)((0, superstruct_1.string)())),
});
exports.ProductRegisterBody = exports.CreateProductBodyStruct;
exports.GetProductListParamsStruct = commonStructs_1.PageParamsStruct;
exports.UpdateProductBodyStruct = (0, superstruct_1.partial)(exports.CreateProductBodyStruct);
