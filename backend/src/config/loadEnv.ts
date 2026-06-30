import path from 'path';
import dotenv from 'dotenv';

const explicitPath = process.env.DOTENV_CONFIG_PATH;
const defaultPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: explicitPath || defaultPath });
