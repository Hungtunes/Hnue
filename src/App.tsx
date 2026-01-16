import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { UserSession, LoginResponse } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);

  const handleLoginSuccess = (data: LoginResponse) => {
    setSession({
      username: data.Id,
      fullName: data.FullName,
      token: data.Token,
    });
  };

  const handleLogout = () => {
    setSession(null);
  };

  if (!session) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
};

export default App;