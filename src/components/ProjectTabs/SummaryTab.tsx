import { useState } from 'react';
import { Save, Loader2, Building2, User, DollarSign, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { Project } from '../../services/api';

interface SummaryTabProps {
  project: Project;
  onSave: (data: Partial<Project>) => Promise<void>;
  saving: boolean;
}

export function SummaryTab({ project, onSave, saving }: SummaryTabProps) {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'Active',
    priority: project.priority || 'Medium',
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    projectUrl: project.projectUrl || '',
    progress: project.progress || 0,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      projectUrl: formData.projectUrl,
      progress: formData.progress,
    });
    setHasChanges(false);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Overview Card */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Project Overview
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#838a9c]">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter project name"
                required
                className="bg-[#1f2330] border-[#3d4457] text-white placeholder:text-[#838a9c]"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-[#838a9c]">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter project description..."
                rows={4}
                className="bg-[#1f2330] border-[#3d4457] text-white placeholder:text-[#838a9c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-[#838a9c]">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3d4457] rounded-lg bg-[#1f2330] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                >
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-[#838a9c]">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3d4457] rounded-lg bg-[#1f2330] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Timeline
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-[#838a9c]">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="bg-[#1f2330] border-[#3d4457] text-white"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="text-[#838a9c]">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="bg-[#1f2330] border-[#3d4457] text-white"
              />
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Progress
          </h3>

          <div>
            <Label htmlFor="progress" className="text-[#838a9c]">
              Completion: {formData.progress}%
            </Label>
            <input
              type="range"
              id="progress"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => handleChange('progress', parseInt(e.target.value))}
              className="w-full h-2 bg-[#3d4457] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#838a9c] mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Additional Information
          </h3>

          <div>
            <Label htmlFor="projectUrl" className="text-[#838a9c]">Project URL</Label>
            <Input
              id="projectUrl"
              type="url"
              value={formData.projectUrl}
              onChange={(e) => handleChange('projectUrl', e.target.value)}
              placeholder="https://..."
              className="bg-[#1f2330] border-[#3d4457] text-white placeholder:text-[#838a9c]"
            />
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-[#0394ff] hover:bg-[#0570cd] text-white">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
