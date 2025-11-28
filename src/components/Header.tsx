import { Search, Bell, Settings, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../utils/i18n/context';
import { User } from '../services/api';

interface HeaderProps {
  onSignOut: () => void;
  user: User | null;
}

export function Header({ onSignOut, user }: HeaderProps) {
  const { t } = useI18n();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.name || user?.email || 'User';
  };

  if (!user) {
    return null;
  }

  return (
    <header className="h-16 bg-[#292d39] border-b border-[#3d4457] flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c] w-4 h-4" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full bg-[#3d4457] border border-[#4a5568] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#838a9c] focus:outline-none focus:ring-2 focus:ring-[#0394ff] focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {/* Notifications */}
        <button className="relative p-2 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded-lg transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a52] rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">3</span>
          </span>
        </button>

        {/* Settings */}
        <button className="p-2 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded-lg transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>

        {/* User Menu */}
        <div className="relative pl-4 border-l border-[#3d4457]">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-[#3d4457] rounded-lg p-2 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {getUserInitials(user.name, user.email)}
              </span>
            </div>
            <div className="text-sm text-left">
              <div className="text-white">{getUserDisplayName()}</div>
              <div className="text-[#838a9c]">
                {user.role || 'Member'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#838a9c]" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#292d39] border border-[#3d4457] rounded-lg shadow-xl z-50 animate-slide-in">
              <div className="p-3 border-b border-[#3d4457]">
                <div className="text-sm font-medium text-white">{getUserDisplayName()}</div>
                <div className="text-xs text-[#838a9c]">{user.email}</div>
              </div>
              <div className="p-2">
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  {t('auth.signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}