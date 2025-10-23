/**
 * User utilities for generating names and colors for collaborative features
 */

// List of fun adjectives and nouns for random name generation
const ADJECTIVES = [
  'Happy', 'Clever', 'Bright', 'Swift', 'Calm', 'Bold', 'Wise', 'Kind',
  'Brave', 'Quick', 'Gentle', 'Proud', 'Noble', 'Eager', 'Jolly', 'Lively'
];

const NOUNS = [
  'Panda', 'Fox', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Wolf', 'Hawk',
  'Owl', 'Deer', 'Falcon', 'Otter', 'Lynx', 'Raven', 'Swan', 'Dolphin'
];

// Vibrant colors for user identification
const USER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E76F51', // Coral
  '#2A9D8F', // Dark Teal
];

/**
 * Generate a random username
 */
export function generateRandomName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

/**
 * Get a consistent color for a user based on their ID
 */
export function getUserColor(userId: string): string {
  // Use a simple hash to get a consistent color for each user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

/**
 * Get user initials from name
 */
export function getUserInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

