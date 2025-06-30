import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class MemoryRateLimiter {
  private store: RateLimitStore = {};
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = options;
    // 定期的にストアをクリーンアップ
    setInterval(() => this.cleanup(), this.options.windowMs);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(req: Request): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      
      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.options.windowMs
        };
      } else {
        this.store[key].count++;
      }

      const current = this.store[key];
      
      // ヘッダーを設定
      res.set({
        'X-RateLimit-Limit': this.options.max.toString(),
        'X-RateLimit-Remaining': Math.max(0, this.options.max - current.count).toString(),
        'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
      });

      if (current.count > this.options.max) {
        return res.status(429).json({
          error: this.options.message,
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        });
      }

      next();
    };
  }
}

export const createRateLimiter = (options: RateLimitOptions) => {
  return new MemoryRateLimiter(options);
};