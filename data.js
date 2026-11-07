// Spaces at PORT-273. Capacity, prices and equipment are placeholders.
const SPACES = [
  {
    id: 'gallery',
    name: 'Gallery',
    area: 120,
    guests: 100,
    price: 1800,
    img: 'img/s1.jpg',
    short: 'Open space with natural light and high ceilings.',
    about: 'A bright white hall with tall factory windows and 5-metre ceilings. Movable walls and track lighting make it easy to hang an exhibition, host an opening or set up a pop-up.',
    features: ['Track lighting', 'Movable walls', 'Sound system', 'Wi-Fi', 'Storage room'],
    goodFor: ['Exhibition', 'Private event', 'Workshop'],
  },
  {
    id: 'studio-black',
    name: 'Studio Black',
    area: 80,
    guests: 20,
    price: 1200,
    img: 'img/s2.jpg',
    short: 'Perfect for photo shoots, recordings and creative productions.',
    about: 'A fully blackout studio with a light kit, backdrops and a dressing room. Built for shoots, interviews and small productions that need full control of light.',
    features: ['Full blackout', 'Studio light kit', 'Paper backdrops', 'Dressing room', 'Freight lift'],
    goodFor: ['Photo shoot', 'Workshop'],
  },
  {
    id: 'lecture-hall',
    name: 'Lecture Hall',
    area: 150,
    guests: 150,
    price: 2200,
    img: 'img/s3.jpg',
    short: 'Equipment for presentations, talks and screenings.',
    about: 'Our largest room, with a 5-metre screen, projector and PA system. Seating can be set as a theatre, in rows or around tables.',
    features: ['Projector & 5 m screen', 'PA with 4 mics', '150 chairs', 'Streaming setup', 'Blackout curtains'],
    goodFor: ['Lecture', 'Private event', 'Workshop'],
  },
  {
    id: 'terrace',
    name: 'Terrace',
    area: 60,
    guests: 60,
    price: 1000,
    img: 'img/s4.jpg',
    short: 'Outdoor space for events, chill and networking.',
    about: 'A rooftop terrace with greenery and a view over the district. Works for afterparties, networking evenings and summer screenings.',
    features: ['Outdoor furniture', 'String lights', 'Bar counter', 'Power outlets', 'Covered area'],
    goodFor: ['Private event', 'Exhibition'],
  },
];

const EVENT_TYPES = ['Workshop', 'Exhibition', 'Photo shoot', 'Lecture', 'Private event'];

const spaceById = id => SPACES.find(s => s.id === id);
const uah = n => '₴' + n.toLocaleString('en-US').replace(/,/g, ' ');
