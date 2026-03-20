export type UserRole = 'guest' | 'user' | 'subscriber' | 'breeder' | 'shelter' | 'admin';
export type ProfessionalAccountType = 'private_breeder' | 'shelter_refuge';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, 'guest'>;
  accountType?: ProfessionalAccountType;
  emailVerified: boolean;
  organizationName?: string;
  phone?: string;
};

export type AuthSession = {
  user: UserProfile;
  token: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user';
};
