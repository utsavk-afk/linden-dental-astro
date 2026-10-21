import { singleton, fields } from '@keystatic/core';
import { ICONS, seoTitle, seoDescription, cta, reqText } from '../fields';

// Field keys mirror src/content/pages/bookPage.json exactly (names and nesting), or the CMS shows empty fields.

// The shared icon list plus the extra Phosphor icons this page uses (all in Icon.astro's allow-list).
const BOOK_ICONS = [
  ...['envelope-simple', 'clipboard-text', 'coffee', 'armchair', 'phone', 'map-pin', 'car', 'wheelchair'].map((v) => ({ label: v, value: v })),
  ...ICONS,
];

// Every visible word on this page is required: Keystatic will not save these fields empty.
const text = (label: string, description?: string, multiline = false) => reqText(label, description, { multiline });

export const bookPage = singleton({
  label: 'Book a visit page',
  path: 'src/content/pages/bookPage',
  format: { data: 'json' },
  schema: {
    intro: fields.object(
      {
        title: text('H1 heading', 'The large heading at the top of the page.'),
        lede: text('Intro paragraph', 'The paragraph under the H1.', true),
        callLabel: text('Paragraph (above the phone button)', 'Small line above the phone button, for example: In pain right now?'),
      },
      { label: 'Hero (H1 + intro)', description: 'The left-hand column at the top of the page.' },
    ),

    nextSteps: fields.array(
      fields.object({
        icon: fields.select({ label: 'Icon', options: BOOK_ICONS, defaultValue: 'envelope-simple' }),
        lead: text('Bold text (strong)', 'Shown in bold, for example: We confirm by email'),
        text: text('Text after the bold part', 'Follows the bold text on the same line.', true),
      }),
      {
        label: 'Next steps list (icon + bold text + text each)',
        description: 'The "what happens next" list under the intro paragraph. Hidden when empty.',
        itemLabel: (p) => p.fields.lead.value || 'Step',
      },
    ),

    form: fields.object(
      {
        whoLegend: text('Fieldset legend (who is it for)'),
        whoMe: text('Radio button label 1 (for me)', 'The answer sent to the practice is always "me"; only the visible text changes.'),
        whoChild: text('Radio button label 2 (for a child)', 'The answer sent to the practice is always "child".'),
        whoFamily: text('Radio button label 3 (for a family)', 'The answer sent to the practice is always "family".'),
        name: text('Field label: name'),
        phone: text('Field label: phone'),
        email: text('Field label: email'),
        emailHelp: text('Help text (email field)', 'Small grey line under the email box.'),
        reason: text('Field label: reason for visit (dropdown)'),
        reasonPlaceholder: text('Dropdown placeholder (reason)', 'Shown in the dropdown before a reason is picked.'),
        days: text('Fieldset legend (times)', 'Shown above the time checkboxes.'),
        nervousLead: text('Toggle switch label: bold text (nervous)'),
        nervousText: text('Toggle switch label: text after the bold part', undefined, true),
        notes: text('Field label: notes'),
        optional: text('Optional field marker', 'Shown after the notes field label, for example: (optional)'),
        submit: text('Submit button text'),
        sending: text('Submit button text while sending'),
        fineStaging: text('Paragraph: small print (staging backend)', 'Shown under the button when the form sends to the demo backend.', true),
        fineConcept: text('Paragraph: small print (concept, no backend)', 'Shown under the button when the form only simulates a send.', true),
      },
      { label: 'Form field labels', description: 'Every visible word on the booking form: legends, field labels, help text and the submit button.' },
    ),

    options: fields.object(
      {
        reasons: fields.array(fields.text({ label: 'Dropdown option', validation: { length: { min: 1, max: 80 } } }), {
          label: 'Dropdown options (reason for visit)',
          description: 'The dropdown choices. Keep each under 80 characters. At least one is required (patients must pick a reason to send the form).',
          validation: { length: { min: 1 } },
          itemLabel: (p) => p.value || 'Reason',
        }),
        days: fields.array(fields.text({ label: 'Checkbox label', validation: { length: { min: 1, max: 40 } } }), {
          label: 'Checkbox options (times that usually work)',
          description: 'The checkbox choices. Up to 6, each under 40 characters. With none, the times question is hidden.',
          validation: { length: { max: 6 } },
          itemLabel: (p) => p.value || 'Time',
        }),
      },
      { label: 'Form choices (dropdown and checkboxes)', description: 'The choices patients pick from. The practice sees the chosen text as written here.' },
    ),

    messages: fields.object(
      {
        name: text('Error message: name missing'),
        emailMissing: text('Error message: email missing'),
        emailInvalid: text('Error message: email looks wrong'),
        phoneMissing: text('Error message: phone missing'),
        phonePattern: text('Error message: phone has letters or symbols'),
        reason: text('Error message: no reason picked'),
        fieldInvalid: text('Error message: other field problem', 'Fallback for any other field that does not look right.'),
        sendFailed: text('Error message: send failed', 'Shown when the request could not be sent and the server gave no reason.'),
        retry: text('Error message: retry suffix', 'Added after every send error, for example: Please try again, or call us.'),
      },
      { label: 'Form validation messages', description: 'Error messages shown when something is missing or the request fails.' },
    ),

    success: fields.object(
      {
        headingPrefix: text('H2 heading: text before the name', 'The H2 reads: [this] [first name][after the name], for example: Thanks, Sam.'),
        headingSuffix: fields.text({ label: 'H2 heading: text after the name', description: 'Usually just a full stop. Optional.' }),
        text: text('Paragraph', 'Write {phone} where the practice phone number should appear.', true),
        link: cta('Link: after sending', 'The arrow link under the paragraph.', 'link'),
      },
      { label: 'Success message (after sending)', description: 'Replaces the form once a request is sent.' },
    ),

    seo: fields.object(
      {
        title: seoTitle(),
        description: seoDescription(),
      },
      { label: 'SEO (meta tags)' },
    ),
  },
});
