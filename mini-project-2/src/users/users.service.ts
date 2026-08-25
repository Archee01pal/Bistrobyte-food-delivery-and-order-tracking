import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  // In-memory persistent database layer for profile records
  private profilesTable: Map<string, UserProfile> = new Map();
  private readonly storageDirectory = path.join(process.cwd(), 'uploads');

  constructor() {
    // Self-healing bootstrap block: guarantees the upload folder exists on startup
    if (!fs.existsSync(this.storageDirectory)) {
      fs.mkdirSync(this.storageDirectory, { recursive: true });
    }
  }

  initializeProfile(userId: string, name: string, email: string): void {
    this.profilesTable.set(userId, {
      userId,
      name,
      email,
      profilePictureUrl: null,
      updatedAt: new Date()
    });
  }

  fetchProfile(userId: string): UserProfile {
    const profile = this.profilesTable.get(userId);
    if (!profile) {
      throw new NotFoundException('The requested user account profile does not exist in the active registry.');
    }
    return profile;
  }

  updateProfile(userId: string, name: string, base64Payload?: string): UserProfile {
    const profile = this.fetchProfile(userId);
    profile.name = name;
    profile.updatedAt = new Date();

    if (base64Payload) {
      try {
        // Strip out metadata headers if present (e.g., "data:image/jpeg;base64,")
        const matchData = base64Payload.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
        let extension = 'png';
        let rawBase64Data = base64Payload;

        if (matchData) {
          extension = matchData[1];
          rawBase64Data = matchData[2];
        }

        // Convert the base64 string stream into a standard binary image buffer block
        const imageBuffer = Buffer.from(rawBase64Data, 'base64');
        const filename = `avatar-${userId}-${Date.now()}.${extension}`;
        const destinationPath = path.join(this.storageDirectory, filename);

        // Commit file stream write out directly to our filesystem folder
        fs.writeFileSync(destinationPath, imageBuffer);
        profile.profilePictureUrl = `uploads/${filename}`;

      } catch (error) {
        throw new BadRequestException('Malformed Base64 string encoding detected. Image conversion aborted.');
      }
    }

    this.profilesTable.set(userId, profile);
    return profile;
  }
}