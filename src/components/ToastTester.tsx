import { toast } from "sonner";
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell,
  Zap,
  Heart,
  Star
} from 'lucide-react';

export function ToastTester() {
  const testSuccess = () => {
    toast.success('✅ Success notification!', {
      description: 'This is a success message with detailed information.',
      duration: 4000,
    });
  };

  const testError = () => {
    toast.error('❌ Error notification!', {
      description: 'Something went wrong. Please try again.',
      duration: 5000,
    });
  };

  const testInfo = () => {
    toast.info('ℹ️ Information notification!', {
      description: 'This is an informational message for the user.',
      duration: 3000,
    });
  };

  const testWarning = () => {
    toast.warning('⚠️ Warning notification!', {
      description: 'Please be careful with this action.',
      duration: 4000,
    });
  };

  const testCustom = () => {
    toast('🎉 Custom notification!', {
      description: 'This is a custom styled notification.',
      duration: 4000,
      action: {
        label: 'Action',
        onClick: () => console.log('Action clicked'),
      },
    });
  };

  const testPromise = () => {
    const myPromise = () => new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.promise(myPromise, {
      loading: 'Loading...',
      success: 'Data loaded successfully!',
      error: 'Error loading data.',
    });
  };

  return (
    <Card className="bg-[#292d39] border-[#3d4457] p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-[#0394ff]" />
          <h3 className="text-white font-medium">Toast Notification Tester</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button
            onClick={testSuccess}
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Button>
          
          <Button
            onClick={testError}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <X className="w-3 h-3 mr-1" />
            Error
          </Button>
          
          <Button
            onClick={testInfo}
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <Info className="w-3 h-3 mr-1" />
            Info
          </Button>
          
          <Button
            onClick={testWarning}
            variant="outline"
            size="sm"
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Button>
          
          <Button
            onClick={testCustom}
            variant="outline"
            size="sm"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Star className="w-3 h-3 mr-1" />
            Custom
          </Button>
          
          <Button
            onClick={testPromise}
            variant="outline"
            size="sm"
            className="border-[#0394ff]/30 text-[#0394ff] hover:bg-[#0394ff]/10"
          >
            <Zap className="w-3 h-3 mr-1" />
            Promise
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-[#3d4457] rounded text-[#838a9c] text-sm">
          <p>Click buttons above to test different toast notification types.</p>
          <p className="mt-1 text-xs">Notifications should appear in the top-right corner.</p>
        </div>
      </div>
    </Card>
  );
}