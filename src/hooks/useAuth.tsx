import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  identify_code: string;
  major: string;
  is_active: boolean | null;
  role: "ADMIN" | "ORGANIZATION" | "STUDENT";
  organization_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isOrganization: boolean;
  isStudent: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const contextValue: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === "ADMIN",
    isOrganization: user?.role === "ORGANIZATION",
    isStudent: user?.role === "STUDENT",
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for role-based authorization
export const useRoleAuth = () => {
  const { isAdmin, isOrganization, isStudent, isLoggedIn } = useAuth();
  
  return {
    checkAdminRole: () => isLoggedIn && isAdmin,
    checkOrganizationRole: () => isLoggedIn && isOrganization,
    checkStudentRole: () => isLoggedIn && isStudent,
    isLoggedIn,
  };
}; 
