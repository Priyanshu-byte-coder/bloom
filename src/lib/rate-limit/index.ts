import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export function getChatLimiter() {
  return new Ratelimit({
    redis: makeRedis(),
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    prefix: 'bloom:chat',
  })
}

export function getGlobalLimiter() {
  return new Ratelimit({
    redis: makeRedis(),
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    prefix: 'bloom:global',
  })
}

export function getJournalLimiter() {
  return new Ratelimit({
    redis: makeRedis(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'bloom:journal',
  })
}
