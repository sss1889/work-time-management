'use client';

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from './ui/theme-toggle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { User, LogOut, Settings, Crown, ChevronRight } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbMap: { [key: string]: string } = {
      'admin': '管理者',
      'users': 'ユーザー管理',
      'attendance': '勤怠管理',
      'history': '勤怠履歴',
      'reports': '日報一覧',
      'dashboard': 'ダッシュボード'
    };

    if (segments.length === 0) return '勤怠入力';
    
    return segments.map(segment => breadcrumbMap[segment] || segment).join(' / ');
  };

  return (
    <header className="bg-card shadow-sm z-10 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">STAR UP勤怠システム</h1>
              <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                <span>{getBreadcrumbs()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Temporary direct links for testing */}
            <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
              プロフィール
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
              設定
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      {user?.role === 'ADMIN' && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          管理者
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>プロフィール</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>設定</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;