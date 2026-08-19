import fs from 'node:fs';
import path from 'node:path';

const config = {
  VITE_API_BASE_URL: '/trading/',
  VITE_AUTH_TOKEN_KEY: 'prod_trading_token',
  VITE_SPACE_NAME: '数据交易平台',
  VITE_DISABLED_IDENTITY_TYPES: []
};

const targetPath = path.resolve(process.cwd(), 'public/config.js');
const content = `window.__APP_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`;

fs.writeFileSync(targetPath, content, 'utf8');
