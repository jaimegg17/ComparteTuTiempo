import React, { createContext, useContext, ReactNode } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface UserProfileContextType {
  userProfile: any;
  profileLoading: boolean;
  displayName: string;
  displayEmail: string;
  displayImage?: string;
  updateUserProfile: (newProfile: Partial<any>) => void;
  loadUserProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const userProfileData = useUserProfile();

  return (
    <UserProfileContext.Provider value={userProfileData}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
};
