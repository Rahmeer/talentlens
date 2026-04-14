import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

/**
 * Ensures upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Save an uploaded file and return its path
 */
export async function saveFile(
  file: File,
  prefix: string = "resume"
): Promise<{ filePath: string; originalName: string; mimeType: string; fileSize: number }> {
  await ensureUploadDir();

  const ext = path.extname(file.name);
  const fileName = `${prefix}_${randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return {
    filePath,
    originalName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  };
}

/**
 * Read a file from disk
 */
export async function readFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    console.warn(`Failed to delete file: ${filePath}`);
  }
}

/**
 * Check max file size (in bytes)
 */
export function getMaxFileSize(): number {
  const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10);
  return maxMb * 1024 * 1024;
}
