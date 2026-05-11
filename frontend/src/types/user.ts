export interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  avatar?: string | null;
  provider: "EMAIL" | "GOOGLE";
  googleId?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  notesCount: number;
  tasksCount: number;
  dreamsCount: number;
  projectsCount: number;
}

export interface UpdateUserPayload {
  name?: string;
  username?: string;
  avatar?: string;
  email?: string;
}

export interface UserProfile extends User {
  stats: UserStats;
}
