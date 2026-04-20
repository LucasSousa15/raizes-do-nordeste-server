import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcryptjs';
import { HashProvider } from '../models/hashing.service';

@Injectable()
export class BcryptProvider implements HashProvider {
  private readonly SALT_ROUNDS = 8;

  async hash(payload: string): Promise<string> {
    return hash(payload, this.SALT_ROUNDS);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return compare(payload, hashed);
  }
}
