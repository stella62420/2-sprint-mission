var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const { db } = require('../utils/db');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
  }
});


const handleFileUpload = upload.single('file');

router.route('/upload')
  .post(handleFileUpload, async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }

    try {
      const fileUrl = `/uploads/${req.file.filename}`;
      const fileRecord = await db.document.create({
        data: {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
      });

      console.log(`File uploaded and recorded: ${fileRecord.id} - URL: ${fileUrl}`);
      res.status(201).json({
        id: fileRecord.id,
        filename: fileRecord.filename,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        url: fileRecord.url,
        createdAt: fileRecord.createdAt,
        updatedAt: fileRecord.updatedAt,
        uploadedFilePath: req.file.path 
      });

    } catch (error) {
      console.error('Error uploading file or saving to DB:', error);
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: '파일 크기가 너무 큽니다 (최대 5MB).' });
        }
        return res.status(400).json({ message: `파일 업로드 오류: ${error.message}` });
      }
      res.status(500).json({ message: '파일 업로드 및 기록에 실패했습니다.' });
    }
  });

router.route('/')
  .get(async (req, res) => {
    try {
      const documents = await db.document.findMany();
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: '파일 목록 조회에 실패했습니다.' });
    }
  });


router.route('/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    try {
      const document = await db.document.findUnique({ where: { id: parseInt(id) } });
      if (!document) {
        return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
      }
      res.json(document);
    } catch (error) {
      console.error('Error fetching document by ID:', error);
      res.status(500).json({ message: '파일 조회에 실패했습니다.' });
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;
    try {
      await db.document.delete({ where: { id: parseInt(id) } });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
      }
      res.status(500).json({ message: '파일 삭제에 실패했습니다.' });
    }
  });

module.exports = router;