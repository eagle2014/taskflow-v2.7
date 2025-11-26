import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Settings as SettingsIcon, Database, Shield, Palette, Info, ExternalLink } from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import { User as UserType } from '../utils/mockApi';
import { TaskSeeder } from './TaskSeeder';

interface SettingsProps {
  currentUser: UserType | null;
}

export function Settings({ currentUser }: SettingsProps) {
  const { t } = useI18n();
  const [userInfo, setUserInfo] = useState({
    email: '',
    created_at: '',
    last_sign_in_at: '',
  });

  useEffect(() => {
    if (currentUser) {
      setUserInfo({
        email: currentUser.email || '',
        created_at: currentUser.created_at || '',
        last_sign_in_at: currentUser.last_active || '',
      });
    }
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="size-8 text-[#0394ff]" />
          <span>Settings</span>
        </h1>
        <p className="text-[#838a9c]">
          Manage your account, preferences, and application settings.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-[#292d39] border-[#3d4457]">
          <TabsTrigger value="account" className="data-[state=active]:bg-[#0394ff] data-[state=active]:text-white text-[#838a9c]">
            <User className="size-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-[#0394ff] data-[state=active]:text-white text-[#838a9c]">
            <Database className="size-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-[#0394ff] data-[state=active]:text-white text-[#838a9c]">
            <Palette className="size-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-[#0394ff] data-[state=active]:text-white text-[#838a9c]">
            <Info className="size-4 mr-2" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className="bg-[#292d39] border-[#3d4457]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <User className="size-5 text-[#0394ff]" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription className="text-[#838a9c]">
                Your account details and authentication information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#838a9c]">Email Address</label>
                  <div className="p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                    <span className="text-sm text-white">{userInfo.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#838a9c]">Account Status</label>
                  <div className="p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                      <Shield className="size-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#838a9c]">Account Created</label>
                  <div className="p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                    <span className="text-sm text-white">{formatDate(userInfo.created_at)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#838a9c]">Last Sign In</label>
                  <div className="p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                    <span className="text-sm text-white">{formatDate(userInfo.last_sign_in_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card className="bg-[#292d39] border-[#3d4457]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="size-5 text-[#0394ff]" />
                <span>Database Management</span>
              </CardTitle>
              <CardDescription className="text-[#838a9c]">
                Manage database seeding and testing functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TaskSeeder currentUser={currentUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-[#292d39] border-[#3d4457]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Palette className="size-5 text-[#0394ff]" />
                <span>Appearance Settings</span>
              </CardTitle>
              <CardDescription className="text-[#838a9c]">
                Customize the look and feel of TaskFlow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                  <div>
                    <h4 className="text-white font-medium">Dark Mode</h4>
                    <p className="text-[#838a9c] text-sm">TaskFlow is optimized for dark theme</p>
                  </div>
                  <Badge className="bg-[#0394ff]/10 text-[#0394ff] border-[#0394ff]/20">
                    Always On
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                  <div>
                    <h4 className="text-white font-medium">Theme Color</h4>
                    <p className="text-[#838a9c] text-sm">Primary blue accent color</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#0394ff] border-2 border-white/20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="bg-[#292d39] border-[#3d4457]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Info className="size-5 text-[#0394ff]" />
                <span>About TaskFlow</span>
              </CardTitle>
              <CardDescription className="text-[#838a9c]">
                Information about TaskFlow project management system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Application Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                      <span className="text-[#838a9c]">Version</span>
                      <span className="text-white">2.0.0</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                      <span className="text-[#838a9c]">Built with</span>
                      <span className="text-white">React & Supabase</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                      <span className="text-[#838a9c]">UI Framework</span>
                      <span className="text-white">Tailwind CSS</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Features</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Project Management</span>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Task Tracking</span>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-[#3d4457] rounded-lg border border-[#4a5568]">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Real-time Sync</span>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-[#3d4457]" />
              
              <div className="text-center space-y-2">
                <p className="text-[#838a9c] text-sm">
                  TaskFlow - Modern Project Management System
                </p>
                <p className="text-[#838a9c] text-xs">
                  Powered by Supabase & Tailwind CSS
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}