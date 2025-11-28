import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { useI18n } from '../utils/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';
import { authApi, User } from '../services/api';

interface SimpleAuthProps {
  onAuthSuccess: (user: User) => void;
}

export function SimpleAuth({ onAuthSuccess }: SimpleAuthProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await authApi.signIn(formData.email, formData.password);
      toast.success(`${t('common.welcome')} ${user.name}!`);
      onAuthSuccess(user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await authApi.signUp(formData.email, formData.password, formData.name);
      toast.success(`${t('common.welcome')} ${user.name}! ${t('auth.accountCreated')}`);
      onAuthSuccess(user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const { user } = await authApi.signIn('admin@taskflow.com', 'password');
      toast.success(`${t('common.welcome')} ${user.name}!`);
      onAuthSuccess(user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181c28] flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">TaskFlow</h1>
            <p className="text-[#838a9c] mt-2">{t('auth.tagline')}</p>
          </div>
        </div>

        {/* Quick Demo Access */}
        <Card className="bg-[#292d39] border-[#3d4457]">
          <CardHeader className="text-center">
            <CardTitle className="text-white">{t('auth.quickDemo')}</CardTitle>
            <p className="text-[#838a9c] text-sm">{t('auth.quickDemoDesc')}</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0394ff] to-[#0570cd] hover:from-[#0570cd] hover:to-[#0394ff] text-white border-0"
            >
              {loading ? t('common.loading') : t('auth.demoLogin')}
            </Button>
          </CardContent>
        </Card>

        {/* Auth Forms */}
        <Card className="bg-[#292d39] border-[#3d4457]">
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-[#3d4457]">
                <TabsTrigger value="signin" className="text-white data-[state=active]:bg-[#0394ff] data-[state=active]:text-white">
                  {t('auth.signIn')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white data-[state=active]:bg-[#0394ff] data-[state=active]:text-white">
                  {t('auth.signUp')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder={t('auth.email')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t('auth.password')}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#0394ff] hover:bg-[#0570cd] text-white"
                  >
                    {loading ? t('common.loading') : t('auth.signIn')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={t('auth.fullName')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder={t('auth.email')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t('auth.password')}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#0394ff] hover:bg-[#0570cd] text-white"
                  >
                    {loading ? t('common.loading') : t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="bg-[#292d39] border-[#3d4457]">
          <CardHeader>
            <CardTitle className="text-white text-sm">{t('auth.demoAccounts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-[#838a9c] space-y-1">
              <div>• admin@taskflow.com ({t('auth.adminAccount')})</div>
              <div>• john.doe@taskflow.com ({t('auth.developerAccount')})</div>
              <div>• jane.smith@taskflow.com ({t('auth.designerAccount')})</div>
            </div>
            <p className="text-xs text-[#838a9c]">{t('auth.demoPassword')}: password</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}