// EmDash content is read live (at request time) through this loader; src/lib/cms.ts wraps it.
import { defineLiveCollection } from 'astro:content';
import { emdashLoader } from 'emdash/runtime';

export const collections = {
  _emdash: defineLiveCollection({ loader: emdashLoader() }),
};
