import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CachingService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(
      process.env.REDIS_HOST || 'redis://127.0.0.1:6379',
      // fail fast instead of queueing commands while Redis is down
      { enableOfflineQueue: false, maxRetriesPerRequest: 1 },
    );

    this.client.on('connect', () => {
      console.log('Redis Cache Engine connected sucessfully via ioredis');
    });

    this.client.on('error', (error) => {
      console.log('Redis Client Error', error);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlInSeconds = 300): Promise<string> {
    return this.client.set(key, value, 'EX', ttlInSeconds);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
