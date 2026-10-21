import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'journal'>;

/** Published posts, newest first. Drafts show only on the local dev server. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('journal', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => +b.data.date - +a.data.date);
}

/** Uses the readMinutes field when set, otherwise ~200 words a minute. */
export function readMinutes(post: Post): number {
  if (post.data.readMinutes) return post.data.readMinutes;
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
