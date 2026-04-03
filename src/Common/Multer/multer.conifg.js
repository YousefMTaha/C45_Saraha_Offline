import multer from "multer";
import { randomUUID } from "crypto";
import path from "node:path";
import { mkdirSync } from "node:fs";

export const allowedFormats = {
  image: ["image/png", "image/jpeg", "image/jpg"],
  video: ["video/mp4"],
  pdf: ["application/pdf"],
};

export function uploadLocal({
  folderName = "General",
  allowedFileFormat = allowedFormats.image,
  fileSize = 5,
}) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const finalDest = path.resolve(`./uploads/${folderName}`);

      mkdirSync(finalDest, { recursive: true });

      cb(null, finalDest);
    },
    filename: function (req, file, cb) {
      const finalName = randomUUID() + "_" + file.originalname;

      file.finalDist = `uploads/${folderName}/${finalName}`;

      cb(null, finalName);
    },
  });

  function fileFilter(req, file, cb) {
    if (!allowedFileFormat.includes(file.mimetype)) {
      return cb(
        new Error("invalid file format", { cause: { statusCode: 400 } }),
      );
    }
    return cb(null, true);
  }

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: fileSize * 1024 * 1024 },
  });
}
