import { config as loadEnv } from 'dotenv';
loadEnv();

export enum AppMode {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export interface Config {
  mode: AppMode;
  apiKey: string;
  apiSecret: string;
  apiUrl: string;
  wsUrl: string;
}

export function loadConfig(): Config {
  const mode = (process.env.APP_MODE || 'development') as AppMode;
  
  let apiKey = '';
  let apiSecret = '';
  let apiUrl = '';
  let wsUrl = '';
  
  if (mode === 'test') {
    apiKey = process.env.GATE_TESTNET_API_KEY || '';
    apiSecret = process.env.GATE_TESTNET_API_SECRET || '';
    apiUrl = process.env.GATE_TESTNET_API_URL || '';
    wsUrl = process.env.GATE_TESTNET_WS_URL || '';
  } else if (mode === 'production') {
    apiKey = process.env.GATE_API_KEY || '';
    apiSecret = process.env.GATE_API_SECRET || '';
    apiUrl = process.env.GATE_API_URL || '';
    wsUrl = process.env.GATE_WS_URL || '';
  } else {
    apiKey = 'dev_mock';
    apiSecret = 'dev_mock';
    apiUrl = 'mock';
    wsUrl = 'mock';
  }
  
  return { mode, apiKey, apiSecret, apiUrl, wsUrl };
}

export function maskKey(key: string): string {
  if (key.length < 8) return '***';
  return key.slice(0, 4) + '...' + key.slice(-4);
}
