import { useState } from 'react';
import { Button } from './ui/button';
import { TaskDetailDialog } from './TaskDetailDialog';
import type { WorkspaceTask } from './TaskDetailDialog/types';

// Sample test task with GUID
const sampleTask: WorkspaceTask = {
  id: '9c214y-a1b2c3-d4e5f6-123456',
  name: 'Research to crush the competition',
  description: '<p>This is a sample task description with <strong>rich text</strong> formatting.</p><ul><li>Item 1</li><li>Item 2</li></ul>',
  assignee: {
    name: 'John Doe',
    avatar: '',
    initials: 'JD',
    color: '#0394ff',
  },
  dueDate: '2025-02-05',
  startDate: '2025-01-15',
  endDate: '2025-02-05',
  status: 'in-progress',
  budget: 44800,
  sprint: '$44,800',
  budgetRemaining: 20000,
  comments: 12,
  phase: 'Phase 1 - Strategy',
  phaseID: 'phase-1',
  projectID: 'project-mgmt',
  impact: 'high',
  files: 3,
};

export function TaskDetailDialogTest() {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState(sampleTask);

  const handleTaskUpdate = (updatedTask: WorkspaceTask) => {
    console.log('Task updated:', updatedTask);
    setTask(updatedTask);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">
            TaskDetailDialog Phase 2 - Test Page
          </h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Test Scenario</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to open the TaskDetailDialog with Phase 2 features:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>✅ <strong>Phase 1</strong>: Header, Metadata, Layout</li>
              <li>✅ <strong>Phase 2 NEW</strong>: Rich text editor (TipTap)</li>
              <li>✅ <strong>Phase 2 NEW</strong>: AI Prompt Bar</li>
              <li>✅ <strong>Phase 2 NEW</strong>: Auto-save with debounce (1s)</li>
              <li>✅ <strong>Phase 2 NEW</strong>: Description formatting (bold, lists, links)</li>
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Testing Checklist - Phase 2</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>Rich Text Editor</strong>: Can format text (bold, italic)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>Lists</strong>: Can create bullet and numbered lists</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>Links</strong>: Can insert hyperlinks</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>Toolbar</strong>: All buttons work and highlight active state</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>Auto-save</strong>: See "Description saved" toast after 1s</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>AI Prompt</strong>: Click "Show AI Assistant" button</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>AI Submit</strong>: Type prompt, press Enter or click Ask</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>AI Close</strong>: Press Escape or click X to hide</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span><strong>Write with AI</strong>: Button in editor toolbar shows prompt</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="w-full"
            >
              🚀 Open TaskDetailDialog (Phase 2)
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Phase 2 Testing Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Rich Text</strong>: Select text and click Bold/Italic buttons</li>
                <li>• <strong>Lists</strong>: Click list buttons to create bullet/numbered lists</li>
                <li>• <strong>Links</strong>: Select text, click link icon, enter URL</li>
                <li>• <strong>Auto-save</strong>: Edit description, wait 1s for toast notification</li>
                <li>• <strong>AI Assistant</strong>: Click "Show AI Assistant" → type prompt → press Enter</li>
                <li>• <strong>Keyboard</strong>: Shift+Enter for new line in AI prompt, Escape to close</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Task Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Current Task State:</h3>
          <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(task, null, 2)}
          </pre>
        </div>
      </div>

      {/* Phase 1 Dialog */}
      <TaskDetailDialog
        open={open}
        onOpenChange={setOpen}
        task={task}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}

export default TaskDetailDialogTest;
