/**
 * The visit count of a single handle; there is one instance per handle,
 * addressed with `idFromName(handle)`.
 *
 * A Durable Object processes its requests one at a time and holds new ones back
 * while storage is busy, so the read-increment-write below is atomic: concurrent
 * visits are never lost and every read sees the latest count.
 */
export class VisitCounter {
  private count = 0;
  private readonly ready: Promise<void>;

  constructor(private readonly state: DurableObjectState) {
    this.ready = state.blockConcurrencyWhile(async () => {
      this.count = (await state.storage.get<number>('count')) ?? 0;
    });
  }

  /** `/hit` adds a visit, `/peek` only reads. Reads never write, so unvisited handles leave no trace. */
  async fetch(request: Request): Promise<Response> {
    await this.ready;

    const { pathname } = new URL(request.url);
    if (pathname === '/hit') {
      this.count += 1;
      await this.state.storage.put('count', this.count);
    } else if (pathname !== '/peek') {
      return new Response('Not found', { status: 404 });
    }

    return Response.json({ count: this.count });
  }
}
