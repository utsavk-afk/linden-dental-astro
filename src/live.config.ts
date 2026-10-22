// EmDash content is read live (at request time) through this loader. File-based collections
// in src/content.config.ts keep working alongside it.
import { defineLiveCollection } from 'astro:content';
import { emdashLoader } from 'emdash/runtime';

export const collections = {
  _emdash: defineLiveCollection({ loader: emdashLoader() }),
};
