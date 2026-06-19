export const NAV_LINKS = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'services', label: 'Services', href: '#services' },
]

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&h=1050&q=80'

const UNSPLASH_IMG = (photoId) =>
  `https://unsplash.com/photos/${photoId}/download?force=true&w=1400&h=1050&fit=crop&fm=jpg`

export const HERO_SLIDES = [
  {
    image: UNSPLASH_IMG('tl447mekwuQ'),
    link: 'https://unsplash.com/photos/woman-in-white-scrub-suit-holding-gray-laptop-computer-tl447mekwuQ',
    headline: 'Book Appointments in Seconds',
    description: 'Find healthcare providers and schedule appointments instantly.',
  },
  {
    image: UNSPLASH_IMG('8WYkI3cEZm8'),
    link: 'https://unsplash.com/photos/doctor-writing-on-a-patients-chart-8WYkI3cEZm8',
    headline: 'Healthcare Made Simple',
    description: 'A seamless healthcare experience for patients and providers.',
  },
  {
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&h=1050&q=80',
    headline: 'Virtual Care Anywhere',
    description: 'Connect with healthcare professionals from any location.',
  },
  {
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&h=1050&q=80',
    headline: 'Trusted Patient Care',
    description: 'Compassionate healthcare backed by modern technology.',
  },
  {
    image: UNSPLASH_IMG('HaCqGNFgiGE'),
    link: 'https://unsplash.com/photos/man-in-white-coat-and-black-pants-standing-beside-white-wooden-picnic-table-HaCqGNFgiGE',
    headline: 'Everything in One Place',
    description: 'Appointments, prescriptions, records, and communication in a unified platform.',
  },
]

export { FALLBACK_IMAGE }

export const TRUST_STATS = [
  { value: '50K+', label: 'Patients Served' },
  { value: '120K+', label: 'Appointments Booked' },
  { value: '800+', label: 'Healthcare Providers' },
  { value: '98%', label: 'Satisfaction Rate' },
]

export const TRUST_BADGES = [
  'Enterprise-grade security',
  'HIPAA-conscious design',
  '24/7 patient support',
]

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Find a Provider',
    description: 'Search by specialty, location, or availability and compare providers that fit your needs.',
  },
  {
    step: '02',
    title: 'Book an Appointment',
    description: 'Choose a time that works for you and confirm in seconds — no phone calls required.',
  },
  {
    step: '03',
    title: 'Receive Care',
    description: 'Attend in-person or virtual visits with your records and messages in one secure place.',
  },
]

export const FEATURES = [
  {
    title: 'Online Appointment Booking',
    description: 'Schedule visits in real time with live availability and instant confirmation.',
  },
  {
    title: 'Medical Records Management',
    description: 'Access prescriptions, visit history, and documents from a single patient dashboard.',
  },
  {
    title: 'Appointment Reminders',
    description: 'Automated notifications help you stay on track and reduce missed appointments.',
  },
  {
    title: 'Secure Messaging',
    description: 'Communicate with your care team through encrypted, HIPAA-conscious messaging.',
  },
  {
    title: 'Telehealth Consultations',
    description: 'Connect with providers via high-quality video visits from anywhere you are.',
  },
  {
    title: 'Patient Dashboard',
    description: 'A unified hub for appointments, records, messages, and health insights.',
  },
]

export const BENEFITS = [
  {
    title: 'Save Time',
    description: 'Skip hold times and paperwork. Book care in under a minute.',
  },
  {
    title: 'Reduce Waiting Periods',
    description: 'Smart scheduling helps providers run on time so you spend less time waiting.',
  },
  {
    title: 'Better Healthcare Access',
    description: 'Find specialists and virtual care options without geographic barriers.',
  },
  {
    title: 'Secure Information Management',
    description: 'Your health data is protected with modern encryption and access controls.',
  },
  {
    title: 'Simplified Appointment Scheduling',
    description: 'Reschedule, cancel, or book follow-ups with a few taps — anytime.',
  },
]
