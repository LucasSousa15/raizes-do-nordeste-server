import { existsSync } from "fs";
import * as dotenv from "dotenv";

if (existsSync('.env')) {
  dotenv.config();
  console.log('✅ Arquivo .env encontrado e carregado.');
} else {
  console.log('ℹ️ Arquivo .env não encontrado, utilizando variáveis de sistema.');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'defaultsecret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),
};
