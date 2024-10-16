import type { Context } from 'hono';
import { getChannelInfoWithPosts } from './telegram-parser.js';
import { buildFeed } from './rss-feed-generator.js';
import { PassThrough } from 'stream';

export async function handleRSSRequest(context: Context) {
  const channel = context.req.param('channel');
  if (!channel) {
    context.status(400);
    return context.json({ error: 'Channel name is required' });
  }

  const postsCountRaw = context.req.query('count');
  const titleMaxLengthRaw = context.req.query('titleMaxLength');
  const postsCount = postsCountRaw ? Math.min(Number(postsCountRaw), 50) : undefined;
  const titleMaxLength = titleMaxLengthRaw ? Number(titleMaxLengthRaw) : undefined;
  try {
    const channelInfo = await getChannelInfoWithPosts(channel, { count: postsCount });
    const stream = new PassThrough();
    buildFeed(channelInfo, stream, { titleMaxLength: titleMaxLength }).then(() => stream.end());
    return context.body(ReadableStream.from(stream), 200, { 'Content-Type': 'application/rss+xml' });
  } catch (e: any) {
    context.status(500);
    return context.json({ error: e.message });
  }
}
