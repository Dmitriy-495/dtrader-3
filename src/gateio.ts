/**
 * @file src/gateio.ts
 * @description Gate.io REST API Client
 */

import axios from 'axios';
import * as crypto from 'crypto';

export class GateIOClient {
  private client: any;
  private apiKey: string;
  private apiSecret: string;

  constructor(apiUrl: string, apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private createSignature(method: string, path: string, query: string, body: string, timestamp: string): string {
    const hashedBody = crypto.createHash('sha512').update(body).digest('hex');
    const message = `${method}\n${path}\n${query}\n${hashedBody}\n${timestamp}`;
    return crypto.createHmac('sha512', this.apiSecret).update(message).digest('hex');
  }

  async getBalance(): Promise<any> {
    const method = 'GET';
    const path = '/api/v4/futures/usdt/accounts';
    const query = '';
    const body = '';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    const signature = this.createSignature(method, path, query, body, timestamp);
    
    const response = await this.client.get(path, {
      headers: {
        'KEY': this.apiKey,
        'SIGN': signature,
        'Timestamp': timestamp,
      },
    });
    
    return response.data;
  }
}
