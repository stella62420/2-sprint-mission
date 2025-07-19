"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = void 0;
const client_1 = require("@prisma/client");
const prisma = global.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
exports.prismaClient = prisma;
