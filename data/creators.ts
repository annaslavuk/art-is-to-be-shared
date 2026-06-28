// All fake creator data for Phase 1. No backend needed — this is the whole "database" for now.

export type Stage =
  | 'just starting out'
  | 'a few projects in'
  | 'working consistently'
  | 'going full-time';

export type Discipline =
  | 'filmmaker'
  | 'photographer'
  | 'musician'
  | 'editor'
  | 'colorist'
  | 'sound designer'
  | 'writer'
  | 'animator';

export type Creator = {
  id: string;
  name: string;
  discipline: Discipline;
  stage: Stage;
  location: string;
  workImageUrl: string;   // Front of card — their WORK, not their face
  workCaption: string;    // One line describing the work shown
  currentProject: string; // "What I'm working on right now" — anchors the match screen next step
  give: string[];         // What they can offer
  get: string[];          // What they're looking for
  tastes: string[];       // Films/artists/albums they love — used for taste-matching later
};

export const ALL_CREATORS: Creator[] = [
  {
    id: 'c1',
    name: 'Maya Reyes',
    discipline: 'filmmaker',
    stage: 'a few projects in',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format',
    workCaption: 'Still from "Margin" — a short about displacement',
    currentProject: 'Shooting a 10-min doc about a flower market in Boyle Heights',
    give: ['directing', 'script feedback', 'producing on micro-budgets'],
    get: ['DP for one weekend shoot', 'colorist for 10 mins of footage'],
    tastes: ['Chantal Akerman', 'Barry Jenkins', 'Josephine Decker'],
  },
  {
    id: 'c2',
    name: 'Jordan Park',
    discipline: 'photographer',
    stage: 'working consistently',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format',
    workCaption: 'From a series on LA rooftop culture',
    currentProject: 'Finishing a 40-image zine about nighttime workers in downtown LA',
    give: ['stills photography', 'photo editing in Lightroom', 'location scouting'],
    get: ['graphic designer for zine layout', 'short film to shoot stills for'],
    tastes: ['Vivian Maier', 'Saul Leiter', 'Deana Lawson'],
  },
  {
    id: 'c3',
    name: 'Theo Nakamura',
    discipline: 'musician',
    stage: 'a few projects in',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format',
    workCaption: 'Recording session — ambient score for short film',
    currentProject: 'Composing an 8-track EP that blends koto with synthesizers',
    give: ['original score composition', 'sound design', 'mixing and mastering'],
    get: ['filmmaker to score a short for', 'music video director'],
    tastes: ['Ryuichi Sakamoto', 'Arca', 'Arthur Russell'],
  },
  {
    id: 'c4',
    name: 'Simone Laurent',
    discipline: 'editor',
    stage: 'working consistently',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format',
    workCaption: 'Edit bay — cutting a narrative short',
    currentProject: 'Looking for a passion project to cut between commercial jobs',
    give: ['narrative editing', 'color correction basics', 'Premiere and DaVinci'],
    get: ['director with a locked script', 'rough cut that needs a fresh eye'],
    tastes: ['Agnès Varda', 'Kelly Reichardt', 'Alfonso Cuarón'],
  },
  {
    id: 'c5',
    name: 'Darius Webb',
    discipline: 'colorist',
    stage: 'going full-time',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format',
    workCaption: 'Grade from a music video — pushed blues and skin tones',
    currentProject: 'Building a reel of narrative work to complement my commercial clients',
    give: ['DaVinci Resolve color grading', 'LUT creation', 'HDR deliverables'],
    get: ['narrative short to grade', 'director who shoots on film or S-log'],
    tastes: ['Roger Deakins', 'Bradford Young', 'Robbie Ryan'],
  },
  {
    id: 'c6',
    name: 'Priya Sharma',
    discipline: 'writer',
    stage: 'a few projects in',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format',
    workCaption: 'Pages from "Secondhand" — a spec pilot',
    currentProject: 'Writing a half-hour pilot about a South Asian family restaurant in Artesia',
    give: ['script feedback', 'story structure notes', 'dialogue punch-up'],
    get: ['director who wants to shoot a proof-of-concept scene', 'producer to attach'],
    tastes: ['Aziz Ansari', 'Mindy Kaling', 'Lena Dunham'],
  },
  {
    id: 'c7',
    name: 'Felix Okonkwo',
    discipline: 'sound designer',
    stage: 'just starting out',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format',
    workCaption: 'Field recording session in the LA River basin',
    currentProject: 'Building a library of environmental sounds from underrepresented LA neighborhoods',
    give: ['field recording', 'sound design', 'Foley and SFX editing'],
    get: ['short film that needs a sound pass', 'filmmaker experimenting with audio-driven storytelling'],
    tastes: ['Walter Murch', 'Hildur Guðnadóttir', 'Ben Burtt'],
  },
  {
    id: 'c8',
    name: 'Luna Castillo',
    discipline: 'animator',
    stage: 'a few projects in',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
    workCaption: 'Frame from "Agua" — a 2D animated short',
    currentProject: 'Pre-production on a 5-min animated short about border crossings',
    give: ['2D animation', 'storyboarding', 'motion graphics'],
    get: ['composer for animated short', 'writer to co-develop a concept'],
    tastes: ['Hayao Miyazaki', 'Isao Takahata', 'Satoshi Kon'],
  },
  {
    id: 'c9',
    name: 'Marcus Bell',
    discipline: 'filmmaker',
    stage: 'just starting out',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format',
    workCaption: 'BTS from first short — shot on borrowed gear',
    currentProject: 'Writing my first narrative short — a day-in-the-life story set in Compton',
    give: ['production assistance', 'on-set PA work', 'enthusiasm'],
    get: ['experienced director to shadow', 'editor who will teach while cutting'],
    tastes: ['Spike Lee', 'John Singleton', 'Ryan Coogler'],
  },
  {
    id: 'c10',
    name: 'Nadia Volkov',
    discipline: 'photographer',
    stage: 'going full-time',
    location: 'Los Angeles, CA',
    workImageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format',
    workCaption: 'From "Pacific Hours" — a long-term portrait project',
    currentProject: 'Shooting a 6-month documentary portrait project on Venice Beach artists',
    give: ['portrait photography', 'documentary photography', 'photo essay editing'],
    get: ['writer to collaborate on a photo book', 'filmmaker for a hybrid doc'],
    tastes: ['Nan Goldin', 'Diane Arbus', 'Larry Clark'],
  },
];
