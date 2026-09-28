import { TooManyRequestsError } from "./apiError";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

interface ThrottleOptions {
  /** Minimum gap between the *start* of two consecutive tasks. */
  minIntervalMs: number;
  /** Max tasks allowed to be waiting for a slot before new ones are rejected. */
  maxQueueSize: number;
}

/**
 * Creates a scheduler that guarantees tasks start at least minIntervalMs
 * apart, no matter how many callers hit it at once.
 *
 * How it works: each call synchronously reserves the next free time slot
 * (JavaScript is single-threaded, so there's no race between reservations),
 * sleeps until that slot arrives, then runs the task. Only start times are
 * spaced out — a slow task doesn't block the next one from starting on
 * schedule.
 *
 * If too many callers are already waiting, new ones are rejected right away
 * with a 429 instead of queueing indefinitely, so a burst of traffic can't
 * pile up minutes of backlog.
 *
 * Limitation: state lives in this Node process's memory, so it only limits
 * a single server instance. If the API ever runs as multiple instances
 * behind a load balancer, this needs a shared store (e.g. Redis) instead.
 * Not solved here because there's no deployment setup yet.
 */
export function createThrottle({ minIntervalMs, maxQueueSize }: ThrottleOptions) {
  let nextSlotAt = 0;
  let waiting = 0;

  return async function schedule<T>(task: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (waiting >= maxQueueSize) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((nextSlotAt - now) / 1000)
      );
      throw new TooManyRequestsError(
        "Search is busy right now. Try again in a few seconds.",
        retryAfterSeconds
      );
    }

    const startAt = Math.max(now, nextSlotAt);
    nextSlotAt = startAt + minIntervalMs;

    const delayMs = startAt - now;
    if (delayMs > 0) {
      waiting++;
      try {
        await sleep(delayMs);
      } finally {
        waiting--;
      }
    }

    return task();
  };
}
