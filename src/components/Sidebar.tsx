import { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { 
  LayoutDashboard, 
  Rocket, 
  User,
  Calendar,
  PieChart,
  Users,
  Settings,
  CheckSquare,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import { Button } from './ui/button';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('home-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('home-sidebar-width');
    return saved ? parseInt(saved) : 256;
  });

  useEffect(() => {
    localStorage.setItem('home-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('home-sidebar-width', width.toString());
  }, [width]);
  
  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'projects', label: t('nav.projects'), icon: Rocket },
    { id: 'project-workspace', label: 'Project Workspace', icon: LayoutGrid },
    { id: 'my-tasks', label: t('nav.myTasks'), icon: User },
    { id: 'calendar', label: t('nav.calendar'), icon: Calendar },
    { id: 'reports', label: t('nav.reports'), icon: PieChart },
    { id: 'team', label: t('nav.team'), icon: Users },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  // Collapsed icon bar view
  if (isCollapsed) {
    return (
      <div className="w-16 bg-[#292d39] border-r border-[#3d4457] flex flex-col h-full">
        {/* Logo Icon Only */}
        <div className="p-4 border-b border-[#3d4457] flex justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-lg flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#0394ff] text-white shadow-lg shadow-[#0394ff]/20'
                        : 'text-[#838a9c] hover:bg-[#3d4457] hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-[#838a9c] group-hover:text-white'
                    }`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Expand Button */}
        <div className="p-2 border-t border-[#3d4457]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-full text-gray-400 hover:text-white hover:bg-[#3d4457]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Resizable
      size={{ width, height: '100%' }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
      minWidth={200}
      maxWidth={400}
      enable={{ right: true }}
      handleStyles={{
        right: {
          width: '4px',
          right: 0,
          cursor: 'col-resize',
        }
      }}
      handleClasses={{
        right: 'hover:bg-[#0394ff] transition-colors'
      }}
    >
      <div className="bg-[#292d39] border-r border-[#3d4457] flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-[#3d4457]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-white truncate">TaskFlow</h1>
                <p className="text-[#838a9c] text-sm truncate">Project Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="text-gray-400 hover:text-white hover:bg-[#3d4457] ml-2 flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#0394ff] text-white shadow-lg shadow-[#0394ff]/20'
                        : 'text-[#838a9c] hover:bg-[#3d4457] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-[#838a9c] group-hover:text-white'
                    }`} />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#3d4457]">
          <div className="text-center text-[#838a9c] text-sm">
            <p>TaskFlow v2.0</p>
            <p className="text-xs mt-1">Advanced Project Management</p>
          </div>
        </div>
      </div>
    </Resizable>
  );
}
