/**
 * Social Features
 * 
 * Health challenges, achievement badges, and community forum for seniors.
 * Promotes engagement, motivation, and peer support.
 */

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  photo?: string;
  bio?: string;
  healthGoals: string[];
  achievements: Achievement[];
  totalPoints: number;
  joinedDate: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedDate?: Date;
  progress?: number; // 0-100
}

export interface HealthChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "steps" | "water" | "meditation" | "social" | "vitals";
  goal: number;
  duration: number; // days
  participants: number;
  startDate: Date;
  endDate: Date;
  reward: number; // points
  status: "upcoming" | "active" | "completed";
}

export interface ChallengeParticipation {
  challengeId: string;
  userId: string;
  progress: number;
  rank: number;
  completed: boolean;
  pointsEarned: number;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments: ForumComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  likes: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userPhoto?: string;
  points: number;
  challengesCompleted: number;
}

/**
 * Sample achievements
 */
const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Log your first daily activity",
    icon: "👣",
    points: 10,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Log activities for 7 consecutive days",
    icon: "🔥",
    points: 50,
  },
  {
    id: "medication-master",
    name: "Medication Master",
    description: "Take all medications on time for 30 days",
    icon: "💊",
    points: 100,
  },
  {
    id: "step-champion",
    name: "Step Champion",
    description: "Walk 10,000 steps in a single day",
    icon: "🏆",
    points: 75,
  },
  {
    id: "health-hero",
    name: "Health Hero",
    description: "Complete 5 health challenges",
    icon: "🦸",
    points: 150,
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Make 10 friends in the community",
    icon: "🦋",
    points: 50,
  },
  {
    id: "wellness-guru",
    name: "Wellness Guru",
    description: "Share 20 health tips in the forum",
    icon: "🧘",
    points: 100,
  },
];

/**
 * Sample health challenges
 */
const SAMPLE_CHALLENGES: HealthChallenge[] = [
  {
    id: "10k-steps",
    name: "10,000 Steps Challenge",
    description: "Walk 10,000 steps every day for a week",
    icon: "🚶",
    type: "steps",
    goal: 70000, // 10k x 7 days
    duration: 7,
    participants: 156,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    reward: 100,
    status: "active",
  },
  {
    id: "hydration-hero",
    name: "Hydration Hero",
    description: "Drink 8 glasses of water daily for 2 weeks",
    icon: "💧",
    type: "water",
    goal: 112, // 8 x 14 days
    duration: 14,
    participants: 203,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    reward: 150,
    status: "active",
  },
  {
    id: "mindful-march",
    name: "Mindful March",
    description: "Meditate for 10 minutes daily for 30 days",
    icon: "🧘",
    type: "meditation",
    goal: 30,
    duration: 30,
    participants: 89,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
    reward: 200,
    status: "upcoming",
  },
];

/**
 * Get all achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  return ACHIEVEMENTS;
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  // In production, fetch from backend
  // Mock: return some unlocked achievements
  return ACHIEVEMENTS.slice(0, 3).map(a => ({
    ...a,
    unlockedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }));
}

/**
 * Check and unlock achievements
 */
export async function checkAchievements(
  userId: string,
  activityData: any
): Promise<Achievement[]> {
  // In production, check conditions and unlock achievements
  const newAchievements: Achievement[] = [];
  
  // Example: Check for "First Steps" achievement
  if (activityData.firstActivity) {
    newAchievements.push(ACHIEVEMENTS[0]);
  }
  
  return newAchievements;
}

/**
 * Get active health challenges
 */
export async function getActiveChallenges(): Promise<HealthChallenge[]> {
  return SAMPLE_CHALLENGES.filter(c => c.status === "active");
}

/**
 * Get all health challenges
 */
export async function getAllChallenges(): Promise<HealthChallenge[]> {
  return SAMPLE_CHALLENGES;
}

/**
 * Join a challenge
 */
export async function joinChallenge(
  userId: string,
  challengeId: string
): Promise<ChallengeParticipation> {
  const participation: ChallengeParticipation = {
    challengeId,
    userId,
    progress: 0,
    rank: 0,
    completed: false,
    pointsEarned: 0,
  };
  
  // In production, save to backend
  console.log("Joined challenge:", challengeId);
  
  return participation;
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  progress: number
): Promise<ChallengeParticipation> {
  // In production, update in backend
  const participation: ChallengeParticipation = {
    challengeId,
    userId,
    progress,
    rank: 1,
    completed: progress >= 100,
    pointsEarned: progress >= 100 ? 100 : 0,
  };
  
  return participation;
}

/**
 * Get challenge leaderboard
 */
export async function getChallengeLeaderboard(
  challengeId: string
): Promise<LeaderboardEntry[]> {
  // In production, fetch from backend
  // Mock leaderboard data
  return [
    {
      rank: 1,
      userId: "user1",
      userName: "Mary Johnson",
      points: 1250,
      challengesCompleted: 8,
    },
    {
      rank: 2,
      userId: "user2",
      userName: "Robert Smith",
      points: 1100,
      challengesCompleted: 7,
    },
    {
      rank: 3,
      userId: "user3",
      userName: "Linda Davis",
      points: 950,
      challengesCompleted: 6,
    },
  ];
}

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  // In production, fetch from backend
  return getChallengeLeaderboard("global");
}

/**
 * Create forum post
 */
export async function createForumPost(
  authorId: string,
  authorName: string,
  title: string,
  content: string,
  category: string,
  tags: string[] = []
): Promise<ForumPost> {
  const post: ForumPost = {
    id: `post-${Date.now()}`,
    authorId,
    authorName,
    title,
    content,
    category,
    tags,
    likes: 0,
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // In production, save to backend
  console.log("Forum post created:", post);
  
  return post;
}

/**
 * Get forum posts
 */
export async function getForumPosts(category?: string): Promise<ForumPost[]> {
  // In production, fetch from backend
  // Mock forum posts
  return [
    {
      id: "post1",
      authorId: "user1",
      authorName: "Mary Johnson",
      title: "Tips for Managing Blood Pressure",
      content: "I've been tracking my BP for 3 months and here's what helped me...",
      category: "Health Tips",
      tags: ["blood pressure", "hypertension"],
      likes: 24,
      comments: [],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "post2",
      authorId: "user2",
      authorName: "Robert Smith",
      title: "Best Walking Routes in Austin",
      content: "Fellow Austinites, here are my favorite senior-friendly walking trails...",
      category: "Exercise",
      tags: ["walking", "exercise", "austin"],
      likes: 18,
      comments: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];
}

/**
 * Add comment to post
 */
export async function addComment(
  postId: string,
  authorId: string,
  authorName: string,
  content: string
): Promise<ForumComment> {
  const comment: ForumComment = {
    id: `comment-${Date.now()}`,
    authorId,
    authorName,
    content,
    likes: 0,
    createdAt: new Date(),
  };
  
  // In production, save to backend
  console.log("Comment added:", comment);
  
  return comment;
}

/**
 * Like a post
 */
export async function likePost(postId: string, userId: string): Promise<boolean> {
  // In production, update in backend
  console.log("Post liked:", postId);
  return true;
}

/**
 * Get achievement icon
 */
export function getAchievementIcon(achievementId: string): string {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  return achievement?.icon || "🏅";
}

/**
 * Calculate achievement progress
 */
export function calculateAchievementProgress(
  achievementId: string,
  userStats: any
): number {
  // In production, calculate based on achievement requirements
  return Math.floor(Math.random() * 100);
}

/**
 * Get challenge type icon
 */
export function getChallengeTypeIcon(type: HealthChallenge["type"]): string {
  const icons = {
    steps: "🚶",
    water: "💧",
    meditation: "🧘",
    social: "👥",
    vitals: "❤️",
  };
  return icons[type] || "🎯";
}

/**
 * Format challenge duration
 */
export function formatChallengeDuration(days: number): string {
  if (days === 1) return "1 day";
  if (days === 7) return "1 week";
  if (days === 14) return "2 weeks";
  if (days === 30) return "1 month";
  return `${days} days`;
}

/**
 * Get challenge status color
 */
export function getChallengeStatusColor(status: HealthChallenge["status"]): string {
  switch (status) {
    case "upcoming":
      return "#F59E0B";
    case "active":
      return "#22C55E";
    case "completed":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
