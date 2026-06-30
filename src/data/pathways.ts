export interface Pathway {
  id: string;
  name: string;
  color: string;
  description: string;
  overview: string;
  focusAreas: string[];
  requiredStrengths: string[];
  subjects: string[];
  careers: string[];
  progressionPaths: string[];
  universityOptions: string[];
  placementStats?: string;
  keyCompetencies: string[];
}

export const pathwaysData: Pathway[] = [
  {
    id: "stem",
    name: "STEM",
    color: "#3b82f6",
    description: "Science, Technology, Engineering & Mathematics",
    overview: "Designed for learners passionate about scientific inquiry, technological innovation, and problem-solving. STEM prepares students for the most in-demand careers in the modern economy.",
    focusAreas: [
      "Pure Sciences (Physics, Chemistry, Biology)",
      "Applied Sciences (Agriculture, Health Sciences)",
      "Technology & Engineering (Computer Science, Aviation, Geospatial Technology)",
      "Career & Technology Studies (Software Development, Data Science)"
    ],
    requiredStrengths: [
      "Logical reasoning",
      "Analytical thinking",
      "Mathematical aptitude",
      "Scientific curiosity",
      "Problem-solving ability"
    ],
    subjects: [
      "Mathematics (Pure/Advanced)",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Agriculture",
      "Aviation Technology",
      "Geospatial Technology",
      "General Science",
      "Building Construction",
      "Electricity",
      "Marine & Fisheries"
    ],
    careers: [
      "Doctors & Surgeons",
      "Pharmacists",
      "Software Engineers & Programmers",
      "Civil Engineers",
      "Mechanical Engineers",
      "Electrical Engineers",
      "Data Scientists",
      "AI/Machine Learning Specialists",
      "Architects",
      "Researchers (Biology, Chemistry, Physics)",
      "Biotechnologists",
      "Agricultural Scientists",
      "Veterinary Scientists",
      "Nurses & Healthcare Technologists",
      "Pilots & Aviation Engineers",
      "Environmental Scientists",
      "Geoscientists",
      "IT Specialists",
      "Network Administrators",
      "Cybersecurity Analysts",
      "Laboratory Technologists"
    ],
    progressionPaths: [
      "University Engineering Programs",
      "Medical Schools (Medicine, Dentistry, Pharmacy)",
      "Technology & IT Universities",
      "Agricultural Universities",
      "TVET Institutions (Technical Skills)",
      "Aviation Training Schools",
      "Research Institutions"
    ],
    universityOptions: [
      "Engineering (Nairobi, Kenyatta, Jomo Kenyatta)",
      "Medical Sciences (University of Nairobi)",
      "Computing & IT (Multiple Universities)",
      "Agriculture (Egerton, JKUAT, Kenyatta)",
      "Environmental Studies",
      "Architecture"
    ],
    placementStats: "59% of Grade 9 students showed STEM aptitude (2025 KJSEA)",
    keyCompetencies: [
      "Critical thinking & analysis",
      "Problem-solving",
      "Digital literacy",
      "Innovation & creativity",
      "Research skills"
    ]
  },
  {
    id: "arts-sports",
    name: "Arts & Sports Science",
    color: "#ec4899",
    description: "Creative Arts, Performing Arts & Athletic Excellence",
    overview: "For learners with talents in creative expression, performing arts, visual arts, and sports. This rapidly growing pathway leads to careers in Kenya's expanding creative economy and sports industry.",
    focusAreas: [
      "Visual Arts (Fine Art, Applied Art, Crafts)",
      "Performing Arts (Music, Theatre, Dance, Elocution)",
      "Media Studies & Film",
      "Sports Science & Physical Education",
      "Time-Based Media"
    ],
    requiredStrengths: [
      "Creativity & imagination",
      "Artistic talent",
      "Physical ability",
      "Communication skills",
      "Collaborative mindset",
      "Emotional intelligence"
    ],
    subjects: [
      "Fine Art",
      "Visual Arts",
      "Performing Arts (Music, Dance, Theatre)",
      "Media Studies",
      "Film Studies",
      "Physical Education",
      "Sports Science",
      "Creative Writing",
      "English Literature",
      "Home Science",
      "Computer Science",
      "Foreign Languages (German, French, Mandarin, Arabic)"
    ],
    careers: [
      "Professional Athletes & Sports Coaches",
      "Sports Managers & Administrators",
      "Physical Therapists",
      "Artists & Sculptors",
      "Musicians & Composers",
      "Actors & Actresses",
      "Dancers & Choreographers",
      "Directors & Film Producers",
      "Journalists & Media Personnel",
      "Documentary Makers",
      "Event Organizers & Planners",
      "Sound Engineers",
      "Cinematographers",
      "Fashion Designers",
      "Graphic Designers",
      "Illustrators",
      "Writers & Poets",
      "Studio Managers",
      "Marketing & Advertising Specialists",
      "Social Media Managers"
    ],
    progressionPaths: [
      "University Arts & Design Programs",
      "Sports Science Universities",
      "Film & Media Schools",
      "Music Conservatories",
      "TVET Creative Industries Programs",
      "International Arts Institutions",
      "Sports Academies"
    ],
    universityOptions: [
      "Fine Arts & Design (Kenyatta, Nairobi)",
      "Media & Communication (Multiple Universities)",
      "Sports Science (Kenyatta, Nairobi)",
      "Music & Performing Arts",
      "Fashion & Textiles Design"
    ],
    placementStats: "48% of Grade 9 students showed Arts & Sports aptitude (2025 KJSEA)",
    keyCompetencies: [
      "Creativity & imagination",
      "Communication & collaboration",
      "Critical thinking",
      "Self-expression",
      "Cultural awareness"
    ]
  },
  {
    id: "social-sciences",
    name: "Social Sciences",
    color: "#10b981",
    description: "Governance, Economics, Education & Human Relations",
    overview: "Ideal for learners interested in understanding society, governance, economics, and human behavior. This pathway develops critical thinkers and future leaders in law, business, education, and public service.",
    focusAreas: [
      "Humanities & Business Studies (History, Economics, Business)",
      "Languages & Literature (English, Kiswahili, Foreign Languages)",
      "Philosophy & Sociology",
      "Government & Civics"
    ],
    requiredStrengths: [
      "Critical thinking",
      "Communication skills",
      "Analytical ability",
      "Leadership qualities",
      "Empathy & people skills",
      "Research ability"
    ],
    subjects: [
      "History & Citizenship",
      "Geography",
      "Business Studies",
      "Government & Political Science",
      "Economics",
      "Sociology",
      "Philosophy",
      "Religious Studies (CRE/IRE/HRE)",
      "English Literature",
      "Kiswahili (Fasihi ya Kiswahili)",
      "Foreign Languages (Arabic, French, German, Mandarin)",
      "Advanced Mathematics",
      "General Science",
      "Computer Studies"
    ],
    careers: [
      "Lawyers & Legal Professionals",
      "Judges & Magistrates",
      "Politicians & Government Officials",
      "Diplomats & International Relations Officers",
      "Economists",
      "Business Managers & Entrepreneurs",
      "Financial Analysts & Accountants",
      "Human Resources Managers",
      "Marketing Specialists",
      "Business Analysts",
      "Teachers & Professors (Social Sciences)",
      "Historians & Archaeologists",
      "Sociologists & Anthropologists",
      "Journalists & Media Analysts",
      "Public Administrators",
      "Development Officers",
      "NGO & Civil Society Leaders",
      "Counselors & Social Workers",
      "Tour Guides & Hospitality Managers",
      "Urban Planners"
    ],
    progressionPaths: [
      "University Law Schools",
      "Business & Commerce Universities",
      "Education & Social Sciences Programs",
      "Government & Public Administration",
      "Economics & Finance Programs",
      "TVET Business & Hospitality",
      "International Relations Programs"
    ],
    universityOptions: [
      "Law Schools (Nairobi, Kenyatta, Strathmore)",
      "Business Schools (Strathmore, JKUAT, Kenyatta)",
      "Education (Kenyatta, Nairobi)",
      "Economics & Finance",
      "Public Administration",
      "International Relations"
    ],
    placementStats: "42% of Grade 9 students showed Social Sciences aptitude (2025 KJSEA)",
    keyCompetencies: [
      "Critical thinking & analysis",
      "Communication & collaboration",
      "Leadership & decision-making",
      "Civic responsibility",
      "Global awareness"
    ]
  }
];

export function getPathwayById(id: string): Pathway | undefined {
  return pathwaysData.find(p => p.id === id);
}

export function searchPathways(query: string): Pathway[] {
  const lowerQuery = query.toLowerCase();
  return pathwaysData.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.focusAreas.some(f => f.toLowerCase().includes(lowerQuery)) ||
    p.careers.some(c => c.toLowerCase().includes(lowerQuery)) ||
    p.subjects.some(s => s.toLowerCase().includes(lowerQuery))
  );
}
