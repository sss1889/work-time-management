
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const Logo: React.FC = () => (
    <div className="flex items-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M16 2L19.09 11.26L29 12.27L22.5 18.89L24.18 29L16 24.27L7.82 29L9.5 18.89L3 12.27L12.91 11.26L16 2Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
        <span className="text-xl font-bold text-slate-800">STAR UP勤怠システム</span>
    </div>
);


interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-600 font-medium hidden sm:block">{user?.name}</span>
              <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                <UserIcon />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-slate-600 hover:text-primary-600 transition-colors"
            >
              <LogoutIcon />
              <span className="hidden sm:block">ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
