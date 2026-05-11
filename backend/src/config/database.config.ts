import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'textlive',
  password: process.env.DB_PASSWORD || 'textlive',
  database: process.env.DB_DATABASE || 'textlive',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
}));
