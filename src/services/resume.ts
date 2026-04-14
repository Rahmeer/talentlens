import * as pdfParse from "pdf-parse";
import * as mammoth from "mammoth";
import { readFile } from "./file-storage";

/**
 * Extract text content from a resume file (PDF or DOCX)
 */
export async function extractResumeText(
  filePath: string,
  mimeType: string
): Promise<string> {
  const buffer = await readFile(filePath);

  if (mimeType === "application/pdf" || filePath.endsWith(".pdf")) {
    return extractFromPdf(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".docx")
  ) {
    return extractFromDocx(buffer);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdf = (pdfParse as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default || pdfParse;
    const data = await (pdf as (buf: Buffer) => Promise<{ text: string }>)(buffer);
    return data.text.trim();
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    console.error("DOCX parsing failed:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}
