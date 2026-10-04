import { describe, expect, it } from 'vitest';
import { countVisit } from '../src/counter/counter-client.js';
import { VisitCounter } from '../src/counter/visit-counter.js';
import { fakeDurableState } from './helpers.js';

async function call(counter: VisitCounter, op: 'hit' | 'peek'): Promise<number> {
  const res = await counter.fetch(new Request(`https://counter/${op}`));
  return ((await res.json()) as { count: number }).count;
}

describe('VisitCounter', () => {
  it('never loses a visit under concurrent traffic', async () => {
    const counter = new VisitCounter(fakeDurableState());
    await Promise.all(Array.from({ length: 100 }, () => call(counter, 'hit')));
    expect(await call(counter, 'peek')).toBe(100);
  });

  it('keeps its count across restarts', async () => {
    const storage = new Map<string, unknown>();
    const first = new VisitCounter(fakeDurableState(storage));
    await call(first, 'hit');
    await call(first, 'hit');

    const restarted = new VisitCounter(fakeDurableState(storage));
    expect(await call(restarted, 'peek')).toBe(2);
  });

  it('does not write anything for a handle that is only looked at', async () => {
    const storage = new Map<string, unknown>();
    const counter = new VisitCounter(fakeDurableState(storage));
    expect(await call(counter, 'peek')).toBe(0);
    expect(storage.size).toBe(0);
  });
});

describe('countVisit', () => {
  it('continues from the last known count when the counter is unreachable', async () => {
    let reachable = true;
    const counters = {
      idFromName: (name: string) => name,
      get: () => ({
        fetch: async () => {
          if (!reachable) throw new Error('unreachable');
          return Response.json({ count: 500 });
        },
      }),
    } as unknown as DurableObjectNamespace;

    expect(await countVisit(counters, 'fallback-user', { readOnly: false })).toBe(500);
    reachable = false;
    expect(await countVisit(counters, 'fallback-user', { readOnly: false })).toBe(501);
    expect(await countVisit(counters, 'fallback-user', { readOnly: true })).toBe(501);
  });
});
