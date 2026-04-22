type ListingLike = {
  id: string;
  title?: string;
  location?: string;
  category?: string;
};

export type ListingHostProfile = {
  name: string;
  avatar: string;
  reviews: string;
  yearsHosting: string;
  bio: string;
  occupation: string;
  languages: string[];
};

const FIRST_NAMES = [
  'Aarav', 'Neha', 'Kunal', 'Rhea', 'Dev', 'Mira', 'Rohan', 'Tara',
  'Ishaan', 'Sana', 'Vihaan', 'Anaya', 'Kabir', 'Meera', 'Zayan', 'Pari',
  'Arjun', 'Siya', 'Reyansh', 'Kiara', 'Aditya', 'Aisha', 'Nikhil', 'Diya',
];

const LAST_NAMES = [
  'Mehta', 'Kapoor', 'Nair', 'Joshi', 'Reddy', 'Sharma', 'Patel', 'Iyer',
  'Malhotra', 'Bose', 'Chopra', 'Saxena', 'Khanna', 'Desai', 'Verma', 'Rao',
  'Bhat', 'Gill', 'Sethi', 'Mistry', 'Dua', 'Arora', 'Menon', 'Shetty',
];

const HOST_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
];

const CATEGORY_OCCUPATIONS: Record<string, string> = {
  homes: 'Hospitality curator',
  experiences: 'Local experience host',
  agents: 'Guest automation specialist',
  services: 'Travel services operator',
};

const CATEGORY_LINES: Record<string, string> = {
  homes: 'I focus on warm arrivals, smooth check-ins, and homes that feel easy to settle into from the first evening.',
  experiences: 'I love creating hosted moments that feel personal, well-paced, and full of local character from start to finish.',
  agents: 'I build smart guest-facing flows and keep the hosting experience fast, helpful, and dependable for every traveler.',
  services: 'I deliver polished add-on services that make the stay feel more thoughtful, more convenient, and more memorable.',
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildAvatarUrl(hash: number) {
  return HOST_AVATARS[hash % HOST_AVATARS.length];
}

function buildLanguages(location: string) {
  const base = ['English', 'Hindi'];
  const lowerLocation = location.toLowerCase();

  if (lowerLocation.includes('goa')) return [...base, 'Konkani'];
  if (lowerLocation.includes('jaipur')) return [...base, 'Marwari'];
  if (lowerLocation.includes('mumbai') || lowerLocation.includes('pune')) return [...base, 'Marathi'];
  if (lowerLocation.includes('bangalore')) return [...base, 'Kannada'];
  if (lowerLocation.includes('hyderabad')) return [...base, 'Telugu'];
  if (lowerLocation.includes('chennai')) return [...base, 'Tamil'];
  if (lowerLocation.includes('delhi')) return [...base, 'Punjabi'];

  return base;
}

export function getHostProfileForListing(listing: ListingLike): ListingHostProfile {
  const baseKey = `${listing.id}-${listing.title || ''}-${listing.location || ''}`;
  const primaryHash = hashString(baseKey);
  const secondaryHash = hashString(`${baseKey}-${listing.category || 'homes'}`);
  const location = listing.location || 'the area';
  const city = location.split(',')[0].trim();
  const category = listing.category || 'homes';

  return {
    name: `${FIRST_NAMES[primaryHash % FIRST_NAMES.length]} ${LAST_NAMES[secondaryHash % LAST_NAMES.length]}`,
    avatar: buildAvatarUrl(primaryHash),
    reviews: String(120 + (primaryHash % 240)),
    yearsHosting: String(3 + (secondaryHash % 9)),
    bio: `I host in ${city} and care a lot about thoughtful details, clear communication, and a stay that feels genuinely well looked after. ${CATEGORY_LINES[category] || CATEGORY_LINES.homes}`,
    occupation: CATEGORY_OCCUPATIONS[category] || CATEGORY_OCCUPATIONS.homes,
    languages: buildLanguages(location),
  };
}
