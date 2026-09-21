import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: 'usr_owner_1',
    username: 'AniFuze Admin',
    email: 'admin@anifuze.site',
    is_admin: true,
    role: 'customer'
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [activeSubAccount, setActiveSubAccount] = useState(null);
  const [subAccounts, setSubAccounts] = useState([]);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      authLoading,
      showAuthModal,
      setShowAuthModal,
      authTab,
      setAuthTab,
      activeSubAccount,
      setActiveSubAccount,
      subAccounts
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    return {
      user: { id: 'usr_owner_1', username: 'AniFuze Admin', is_admin: true },
      authLoading: false,
      setShowAuthModal: () => {},
      setAuthTab: () => {},
      activeSubAccount: null,
      subAccounts: []
    };
  }
  return context;
}
