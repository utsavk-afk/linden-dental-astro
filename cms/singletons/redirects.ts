import { singleton, fields } from '@keystatic/core';

// Editable redirects (like the WordPress Redirection plugin). Read by astro.config.mjs at build.
// Add one whenever you change a URL slug (permalink) of a published page or post.
export const redirects = singleton({
  label: 'Redirects (301)',
  path: 'src/content/redirects',
  format: { data: 'json' },
  schema: {
    items: fields.array(
      fields.object({
        from: fields.text({
          label: 'Old URL path',
          description: 'The address that no longer exists, for example /journal/old-post-name/. Must start with /.',
          validation: { length: { min: 2, max: 200 }, pattern: { regex: /^\/[^\s?#]*$/, message: 'Start with / and leave out the domain, spaces, ? and #.' } },
        }),
        to: fields.text({
          label: 'New URL',
          description: 'Where visitors should go instead: a path on this site like /journal/new-post-name/ or a full https:// URL.',
          validation: { length: { min: 1, max: 300 } },
        }),
      }),
      {
        label: 'Redirects',
        description: 'Visitors and Google following an old link are sent to the new address. Live after the next publish (about 2 minutes).',
        itemLabel: (p) => `${p.fields.from.value || '(old)'}  ->  ${p.fields.to.value || '(new)'}`,
      },
    ),
  },
});
