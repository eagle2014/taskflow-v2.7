import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Bug,
  Search,
  Database,
  Terminal,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Play,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface DebugGuideProps {
  session: any;
}

export function DebugGuide({ session }: DebugGuideProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);

  const markStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const toggleSection = (stepNumber: number) => {
    if (expandedSections.includes(stepNumber)) {
      setExpandedSections(expandedSections.filter(s => s !== stepNumber));
    } else {
      setExpandedSections([...expandedSections, stepNumber]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const debugSteps = [
    {
      id: 1,
      title: "UI Debugging - My Tasks Page",
      description: "Sử dụng UI debug tools để check task data",
      icon: Bug,
      color: "blue",
      actions: [
        {
          title: "Navigate to My Tasks",
          description: "Click 'My Tasks' trong sidebar để mở page",
          instruction: "Sidebar → My Tasks",
          expected: "My Tasks page loads với task statistics"
        },
        {
          title: "Check Data Source Badge",
          description: "Kiểm tra badge hiển thị data source (Mock/Supabase)",
          instruction: "Look for badge next to page title",
          expected: "Badge shows 'Supabase Data' (green) hoặc 'Mock Data' (yellow)"
        },
        {
          title: "Click Debug Button",
          description: "Click Debug button để mở debug panel",
          instruction: "Top right → Debug button",
          expected: "Debug panel hiển thị session info và task counts"
        },
        {
          title: "Check Session Info",
          description: "Verify session information trong debug panel",
          instruction: "Debug Panel → Session Info section",
          expected: "User ID, Token (first 20 chars), Is Demo status"
        }
      ]
    },
    {
      id: 2,
      title: "Database Search - Find 'test trung'",
      description: "Search directly trong Supabase database",
      icon: Search,
      color: "green",
      actions: [
        {
          title: "Click Search DB Button",
          description: "Click 'Search DB' button để search task 'test trung'",
          instruction: "Top right → Search DB button",
          expected: "Search results hiển thị trong debug panel"
        },
        {
          title: "Analyze Search Results",
          description: "Check search results trong debug panel",
          instruction: "Debug Panel → Latest Search Results section",
          expected: "JSON với database_results và kv_results"
        },
        {
          title: "Custom Search",
          description: "Thay đổi search term nếu cần",
          instruction: "Modify search term trong code hoặc URL",
          expected: "Search với custom term"
        }
      ]
    },
    {
      id: 3,
      title: "Console Debugging",
      description: "Monitor detailed logs trong browser console",
      icon: Terminal,
      color: "purple",
      actions: [
        {
          title: "Open Browser Console",
          description: "Mở Developer Tools console",
          instruction: "F12 → Console tab",
          expected: "Console mở và ready để monitor logs"
        },
        {
          title: "Clear Console",
          description: "Clear existing logs để focus on new data",
          instruction: "Console → Clear button hoặc Ctrl+L",
          expected: "Empty console"
        },
        {
          title: "Refresh Tasks",
          description: "Click Refresh button và monitor console logs",
          instruction: "Click Refresh → Watch console",
          expected: "Detailed logs: '🚀 === LOADING TASKS STARTED ===' etc."
        },
        {
          title: "Create New Task",
          description: "Tạo task mới và monitor creation flow",
          instruction: "New Task → Fill form → Submit → Watch console",
          expected: "Task creation logs with verification steps"
        }
      ]
    },
    {
      id: 4,
      title: "Direct API Testing",
      description: "Test API endpoints directly trong console",
      icon: Database,
      color: "orange",
      actions: [
        {
          title: "Get Access Token",
          description: "Lấy access token từ session",
          instruction: "Debug panel → Session Info → Token",
          expected: "Access token visible (first 20 chars shown)"
        },
        {
          title: "Test Search Endpoint",
          description: "Direct API call để search task",
          instruction: "Copy và run search command trong console",
          command: `fetch('https://lmvuisccheszbanpaccg.supabase.co/functions/v1/make-server-8837ac96/debug/search-task?q=test%20trung', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
}).then(r => r.json()).then(console.log)`,
          expected: "Search results with database và KV store data"
        },
        {
          title: "List All Tasks",
          description: "Get complete task list từ database",
          instruction: "Run list all tasks command",
          command: `fetch('https://lmvuisccheszbanpaccg.supabase.co/functions/v1/make-server-8837ac96/debug/list-all-tasks', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
}).then(r => r.json()).then(console.log)`,
          expected: "All tasks from database và KV store"
        },
        {
          title: "Health Check",
          description: "Verify API server health",
          instruction: "Run health check command",
          command: `fetch('https://lmvuisccheszbanpaccg.supabase.co/functions/v1/make-server-8837ac96/debug/health', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
}).then(r => r.json()).then(console.log)`,
          expected: "Server status, data counts, recent tasks"
        }
      ]
    },
    {
      id: 5,
      title: "Task Creation Verification",
      description: "Verify task creation flow hoạt động correctly",
      icon: CheckCircle,
      color: "green",
      actions: [
        {
          title: "Create Test Task",
          description: "Tạo task mới với title 'test trung debug'",
          instruction: "New Task → Title: 'test trung debug' → Submit",
          expected: "Success message hiển thị"
        },
        {
          title: "Monitor Creation Logs",
          description: "Watch console logs during task creation",
          instruction: "Console tab → Monitor creation process",
          expected: "Logs show: '💾 Saving task to database' và verification"
        },
        {
          title: "Verify Auto Refresh",
          description: "Check if task list auto refreshes",
          instruction: "Wait for auto refresh sau task creation",
          expected: "New task appears trong task list"
        },
        {
          title: "Manual Search",
          description: "Search for newly created task",
          instruction: "Search DB → Look for 'test trung debug'",
          expected: "Task found trong search results"
        }
      ]
    },
    {
      id: 6,
      title: "Database Direct Access",
      description: "Check Supabase dashboard directly",
      icon: ExternalLink,
      color: "red",
      actions: [
        {
          title: "Open Supabase Dashboard",
          description: "Access Supabase project dashboard",
          instruction: "https://supabase.com/dashboard/project/lmvuisccheszbanpaccg",
          expected: "Supabase dashboard loads"
        },
        {
          title: "Check Database Tables",
          description: "Navigate to database tables",
          instruction: "Dashboard → Database → Tables",
          expected: "List of tables including taskflow_tasks_8837ac96"
        },
        {
          title: "Query Tasks Table",
          description: "View tasks table data",
          instruction: "Tables → taskflow_tasks_8837ac96 → View data",
          expected: "Table data với all tasks including 'test trung'"
        },
        {
          title: "Filter by Title",
          description: "Search for specific task trong table",
          instruction: "Add filter: title contains 'test trung'",
          expected: "Filtered results showing matching tasks"
        }
      ]
    }
  ];

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'complete';
    if (stepId === activeStep) return 'active';
    return 'pending';
  };

  const getStatusIcon = (stepId: number) => {
    const status = getStepStatus(stepId);
    if (status === 'complete') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (status === 'active') return <Play className="w-5 h-5 text-blue-400" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (stepId: number) => {
    const status = getStepStatus(stepId);
    if (status === 'complete') return 'border-green-500/30 bg-green-500/10';
    if (status === 'active') return 'border-blue-500/30 bg-blue-500/10';
    return 'border-gray-500/30 bg-gray-500/10';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Bug className="w-8 h-8 text-[#0394ff]" />
            TaskFlow Debug Guide
          </h1>
          <p className="text-[#838a9c] mt-1">
            Comprehensive debugging tools để find task "test trung" và troubleshoot issues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
            <CheckCircle className="w-3 h-3 mr-1" />
            {completedSteps.length}/{debugSteps.length} Completed
          </Badge>
          {session?.access_token === 'demo-token' && (
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h3 className="text-white font-medium mb-4">Debug Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {debugSteps.map((step) => {
            const status = getStepStatus(step.id);
            const IconComponent = step.icon;
            
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${getStatusColor(step.id)}`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-5 h-5 ${
                    status === 'complete' ? 'text-green-400' :
                    status === 'active' ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  {getStatusIcon(step.id)}
                </div>
                <h4 className="text-white text-sm font-medium mb-1">{step.title}</h4>
                <p className="text-[#838a9c] text-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed Steps */}
      <div className="space-y-4">
        {debugSteps.map((step) => {
          const IconComponent = step.icon;
          const isExpanded = expandedSections.includes(step.id);
          const isActive = step.id === activeStep;
          const isComplete = completedSteps.includes(step.id);
          
          return (
            <Card key={step.id} className={`bg-[#292d39] border-[#3d4457] ${isActive ? 'ring-2 ring-blue-500/30' : ''}`}>
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleSection(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-500/20 text-green-400' :
                      isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        Step {step.id}: {step.title}
                      </h3>
                      <p className="text-[#838a9c] text-sm">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                        Active
                      </Badge>
                    )}
                    {isComplete && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                        Complete
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="space-y-4">
                    {step.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="bg-[#3d4457] rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium">{action.title}</h4>
                          <Badge variant="outline" className="border-[#4a5568] text-[#838a9c]">
                            {actionIndex + 1}/{step.actions.length}
                          </Badge>
                        </div>
                        <p className="text-[#838a9c] text-sm mb-3">{action.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400 text-sm font-medium">Instruction:</span>
                            <span className="text-white text-sm">{action.instruction}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 text-sm font-medium">Expected:</span>
                            <span className="text-white text-sm">{action.expected}</span>
                          </div>
                          
                          {action.command && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-yellow-400 text-sm font-medium">Console Command:</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(action.command)}
                                  className="border-[#4a5568] text-[#838a9c] hover:text-white"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="bg-[#1a1f2b] p-3 rounded text-xs text-green-400 overflow-x-auto">
                                {action.command}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => markStepComplete(step.id)}
                      disabled={isComplete}
                      className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                    >
                      {isComplete ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Quick Debug Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="border-[#4a5568] text-[#838a9c] hover:text-white justify-start"
            onClick={() => window.open('https://supabase.com/dashboard/project/lmvuisccheszbanpaccg/database/tables', '_blank')}
          >
            <Database className="w-4 h-4 mr-2" />
            Supabase Tables
          </Button>
          <Button
            variant="outline"
            className="border-[#4a5568] text-[#838a9c] hover:text-white justify-start"
            onClick={() => window.open('https://supabase.com/dashboard/project/lmvuisccheszbanpaccg/logs/edge-functions', '_blank')}
          >
            <Terminal className="w-4 h-4 mr-2" />
            Edge Function Logs
          </Button>
          <Button
            variant="outline"
            className="border-[#4a5568] text-[#838a9c] hover:text-white justify-start"
            onClick={() => window.open('https://supabase.com/dashboard/project/lmvuisccheszbanpaccg/api/keys', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            API Keys
          </Button>
        </div>
      </Card>

      {/* Common Issues */}
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Common Issues & Solutions
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-[#3d4457] rounded-lg">
            <h4 className="text-yellow-400 font-medium mb-2">Task not appearing trong My Tasks</h4>
            <ul className="text-[#838a9c] text-sm space-y-1">
              <li>• Check if task was assigned to correct user ID</li>
              <li>• Verify task has valid project_id</li>
              <li>• Ensure task status is not filtered out</li>
              <li>• Check if task exists trong database via Search DB</li>
            </ul>
          </div>
          <div className="p-4 bg-[#3d4457] rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">Demo Mode Limitations</h4>
            <ul className="text-[#838a9c] text-sm space-y-1">
              <li>• Database search not available trong demo mode</li>
              <li>• Tasks stored trong memory only (not persistent)</li>
              <li>• Use real authentication for full debugging</li>
            </ul>
          </div>
          <div className="p-4 bg-[#3d4457] rounded-lg">
            <h4 className="text-green-400 font-medium mb-2">API Not Responding</h4>
            <ul className="text-[#838a9c] text-sm space-y-1">
              <li>• Check network tab trong DevTools</li>
              <li>• Verify access token is valid</li>
              <li>• Check Supabase Edge Function logs</li>
              <li>• Ensure CORS headers are correct</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}