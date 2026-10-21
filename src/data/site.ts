// Linden Dental Studio is a fictional practice. Phone uses the reserved 555-01xx range.
export const site = {
  name: 'Linden Dental Studio',
  short: 'Linden',
  tagline: 'Family dentistry in Sellwood, Portland',
  phone: '(503) 555-0142',
  phoneHref: 'tel:+15035550142',
  email: 'hello@lindendental.example',
  address: ['1504 SE Tacoma St', 'Portland, OR 97202'],
  mapHref: 'https://www.openstreetmap.org/search?query=SE%20Tacoma%20St%20Portland',
  hours: [
    { days: 'Mon to Thu', time: '7:30 am to 6:00 pm' },
    { days: 'Friday', time: '7:30 am to 3:00 pm' },
    { days: 'Saturday', time: '8:00 am to 1:00 pm' },
  ],
  nav: [
    { href: '/about/', label: 'About' },
    { href: '/services/', label: 'Services' },
    { href: '/journal/', label: 'Journal' },
  ],
  cta: { href: '/book/', label: 'Book a visit' },
};
