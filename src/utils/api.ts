import { SocialProfile } from '../types';

const generateRandomDate = () => {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomArray = (items: string[], count: number = 3) => {
  return items
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};

export const generateInsights = async (urls: { linkedin?: string, facebook?: string }): Promise<SocialProfile> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const companyMilestones = [
    "Expanded operations to 3 new markets",
    "Achieved ISO 9001 certification",
    "Launched innovative product line",
    "Secured major industry partnership",
    "Reached 1000 customer milestone",
    "Opened new headquarters"
  ];

  const companyAwards = [
    "Best Workplace Award 2024",
    "Industry Innovation Prize",
    "Sustainability Excellence Award",
    "Customer Service Recognition",
    "Top Growth Company"
  ];

  const companyNews = [
    "Recently completed Series B funding round",
    "Announced strategic partnership with industry leader",
    "Launched new sustainable initiative",
    "Featured in Industry Weekly magazine",
    "Expanded product portfolio"
  ];

  const companyOfferings = [
    "Enterprise Solutions",
    "Custom Development Services",
    "Cloud Infrastructure",
    "Digital Transformation",
    "Professional Services"
  ];

  const companyCulture = [
    "Remote-first workplace",
    "Emphasis on work-life balance",
    "Strong professional development program",
    "Inclusive and diverse environment",
    "Regular team building activities"
  ];

  const careerHighlights = [
    "Led major digital transformation project",
    "Managed team of 15+ professionals",
    "Increased department efficiency by 40%",
    "Spearheaded innovative product launch",
    "Developed strategic partnerships"
  ];

  const educationDetails = [
    "MBA in Business Administration",
    "BS in Computer Science",
    "Professional certifications in project management",
    "Industry-specific training",
    "Leadership development program"
  ];

  const professionalInterests = [
    "Digital Innovation",
    "Sustainable Technology",
    "Artificial Intelligence",
    "Business Strategy",
    "Professional Development"
  ];

  const publications = [
    "Published article on industry trends",
    "Regular blog contributor",
    "Featured in technology magazine",
    "Co-authored whitepaper",
    "Industry conference speaker"
  ];

  const socialCauses = [
    "Environmental sustainability advocate",
    "STEM education volunteer",
    "Diversity in tech supporter",
    "Community outreach participant",
    "Mentorship program leader"
  ];

  const recentActivities = [
    "Spoke at industry conference",
    "Led workshop on emerging technologies",
    "Participated in leadership summit",
    "Mentored junior professionals",
    "Contributed to open source projects"
  ];

  const achievements = [
    "Industry recognition award recipient",
    "Patent holder for innovative solution",
    "Featured in business publication",
    "Advisory board member",
    "Successful product launch lead"
  ];

  return {
    companyInfo: {
      founded: generateRandomDate().getFullYear().toString(),
      milestones: generateRandomArray(companyMilestones, 4),
      awards: generateRandomArray(companyAwards, 3),
      recentNews: generateRandomArray(companyNews, 3),
      offerings: generateRandomArray(companyOfferings, 4),
      culture: generateRandomArray(companyCulture, 3)
    },
    personalInfo: {
      career: generateRandomArray(careerHighlights, 4),
      education: generateRandomArray(educationDetails, 3),
      interests: generateRandomArray(professionalInterests, 4),
      publications: generateRandomArray(publications, 3),
      causes: generateRandomArray(socialCauses, 3),
      recentActivity: generateRandomArray(recentActivities, 4),
      achievements: generateRandomArray(achievements, 3)
    },
    lastUpdated: new Date()
  };
};