import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'journal'>;

// Drafts show on the local dev server and on staging builds (PUBLIC_SHOW_DRAFTS=1, set by the
// publish Action) so editors can preview them; production builds leave them out.
export const showDrafts = import.meta.env.DEV || !!import.meta.env.PUBLIC_SHOW_DRAFTS;

/** Published posts (plus drafts where showDrafts), newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('journal', ({ data }) => showDrafts || !data.draft);
  return posts.sort((a, b) => +b.data.date - +a.data.date);
}

/** Reading time, always calculated from the article at ~200 words a minute. */
export function readMinutes(post: Post): number {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
