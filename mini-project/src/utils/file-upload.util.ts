/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

export function saveBase64Image(base64Str: string, userId: string): string {
  // Validate base64 format and extract mime type
  const matches = base64Str.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new BadRequestException('Invalid base64 image string format');
  }

  const imageExtension = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Strict file size limitation check (e.g., 5MB max)
  if (buffer.length > 5 * 1024 * 1024) {
    throw new BadRequestException('Image file size exceeds the 5MB limit');
  }

  // Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate a unique filename using timestamp and user ID
  const fileName = `profile-${userId}-${Date.now()}.${imageExtension}`;
  const filePath = path.join(uploadDir, fileName);

  // Write file to server storage
  fs.writeFileSync(filePath, buffer);

  // Return accessible public web URL path
  return `/uploads/${fileName}`;
}