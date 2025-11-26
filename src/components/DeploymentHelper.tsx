import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { debugApiConnectivity } from '../utils/api';

export function DeploymentHelper() {
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const result = await debugApiConnectivity();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">TaskFlow - LocalStorage Mode</h1>
        <p className="text-[#838a9c]">
          No deployment needed! All data is stored locally in your browser
        </p>
      </div>

      {/* Connection Status */}
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">System Status</h2>
          <Button
            onClick={checkConnection}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="bg-[#3d4457] border-[#4a5568] text-white hover:bg-[#4a5568]"
          >
            {isChecking ? 'Checking...' : 'Test System'}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>System ready - Using localStorage!</span>
            </div>
          )}
          {connectionStatus === 'disconnected' && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span>System check failed - localStorage may not be available</span>
            </div>
          )}
          {connectionStatus === 'unknown' && (
            <div className="flex items-center gap-2 text-[#838a9c]">
              <AlertTriangle className="w-5 h-5" />
              <span>Unknown - Click "Test System" to check</span>
            </div>
          )}
        </div>
      </Card>

      {/* No Supabase Info */}
      <Card className="bg-green-500/10 border-green-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <h2 className="text-lg font-medium text-green-400">No Backend Required!</h2>
        </div>
        
        <p className="text-[#838a9c] mb-4">
          TaskFlow is now running in <strong className="text-white">localStorage mode</strong>:
        </p>
        
        <ul className="space-y-2 text-sm text-[#838a9c]">
          <li>• ✅ No Supabase setup needed</li>
          <li>• ✅ No backend deployment required</li>
          <li>• ✅ All data stored in browser localStorage</li>
          <li>• ✅ Works offline</li>
          <li>• ✅ Instant setup - ready to use!</li>
        </ul>

        <div className="mt-4">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
          >
            Start Using TaskFlow
          </Button>
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="bg-yellow-500/10 border-yellow-500/20 p-6">
        <h2 className="text-lg font-medium text-yellow-400 mb-4">Important Notes</h2>
        
        <div className="space-y-3 text-sm text-[#838a9c]">
          <p>
            <strong className="text-yellow-400">Data Persistence:</strong> Your data is stored in browser localStorage. 
            Clearing browser data will delete all TaskFlow data.
          </p>
          
          <p>
            <strong className="text-yellow-400">No Sync:</strong> Data is not synced between devices or browsers. 
            Each browser has its own separate data.
          </p>
          
          <p>
            <strong className="text-yellow-400">Storage Limits:</strong> Browsers typically allow 5-10MB of localStorage. 
            This is sufficient for most use cases.
          </p>
          
          <p>
            <strong className="text-yellow-400">Export/Backup:</strong> Consider periodically exporting your data 
            from Settings to backup your work.
          </p>
        </div>
      </Card>

      {/* Features Available */}
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h2 className="text-lg font-medium text-white mb-4">Available Features</h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="text-[#0394ff] font-medium">✓ Project Management</h3>
            <ul className="space-y-1 text-[#838a9c]">
              <li>• Create & manage projects</li>
              <li>• Organize with spaces & phases</li>
              <li>• Track progress</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-[#0394ff] font-medium">✓ Task Management</h3>
            <ul className="space-y-1 text-[#838a9c]">
              <li>• Add tasks & subtasks</li>
              <li>• Set priorities & due dates</li>
              <li>• Track time</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-[#0394ff] font-medium">✓ Multiple Views</h3>
            <ul className="space-y-1 text-[#838a9c]">
              <li>• List, Board, Gantt</li>
              <li>• Calendar, Mind Map</li>
              <li>• Workload view</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-[#0394ff] font-medium">✓ Collaboration</h3>
            <ul className="space-y-1 text-[#838a9c]">
              <li>• Assign tasks to team</li>
              <li>• Add comments</li>
              <li>• Track activity</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
