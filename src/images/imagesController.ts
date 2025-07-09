import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PUBLIC_PATH, STATIC_PATH } from '../lib/constants';
import BadRequestError from '../lib/errors/BadRequestError';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, PUBLIC_PATH);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new BadRequestError('Only png, jpeg, and jpg are allowed'));
    }
    cb(null, true);
  },
});

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    throw new BadRequestError('No image file was uploaded');
  }

  const protocol = req.protocol;
  const host = req.get('host');
  const url = `${protocol}://${host}/public/${req.file.filename}`;

  res.status(201).json({ url });
}
