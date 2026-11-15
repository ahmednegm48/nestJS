import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CachingService } from '../caching.service.js';
import type { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: CachingService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.method !== 'GET') return next.handle();

    const cacheKey = `cache:${request.originalUrl || request.url}`;

    try {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) return of(JSON.parse(cachedData));
    } catch (error) {
      console.log('Redis read failure safly skipped', error);
    }

    return next.handle().pipe(
      mergeMap(async (data) => {
        try {
          if (data)
            await this.redisService.set(cacheKey, JSON.stringify(data), 360);
        } catch (error) {
          console.log('Redis write failure', error);
        }
        return data;
      }),
    );
  }
}
