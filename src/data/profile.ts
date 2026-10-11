export const profile = {
  name: 'Gen Li',
  role: 'Ph.D. student, Biomedical Engineering',
  affiliation: 'University of Toronto',
  supervisor: 'Bowen Li',
  location: 'Toronto, Canada',
  email: 'reaganree.li@mail.utoronto.ca',
  cv: '', // put a PDF at public/cv.pdf and set this to '/cv.pdf'
  avatar: '', // put a square photo at public/images/avatar.jpg and set this to '/images/avatar.jpg'
  // Contact form: get a free access key at https://web3forms.com (messages are forwarded to your email).
  web3formsKey: 'e8131b8e-7964-4b84-bf12-16b18fe206e7',
  interests: [
    'Generative models for biomolecules',
    'Agentic molecular discovery',
    'Self-driving laboratories',
    'Inference-time search',
  ],
};

export const socials = [
  { label: 'GitHub', href: 'https://github.com/ReaganGen' },
  { label: 'Scholar', href: 'https://scholar.google.com/citations?user=tgEXcfsAAAAJ' },
  { label: 'Email', href: `mailto:${profile.email}` },
];
