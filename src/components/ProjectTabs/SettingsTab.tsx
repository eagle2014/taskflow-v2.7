import { useState } from 'react';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import type { Project } from '../../services/api';

interface SettingsTabProps {
  project: Project;
  onSave: (data: Partial<Project>) => Promise<void>;
  saving: boolean;
}

export function SettingsTab({ project, onSave, saving }: SettingsTabProps) {
  const [categoryID, setCategoryID] = useState(project.categoryID || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleCategoryChange = (value: string) => {
    setCategoryID(value);
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ categoryID });
    setHasChanges(false);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Settings */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Category Settings
          </h3>

          <div>
            <Label htmlFor="categoryID" className="text-[#838a9c]">Project Category</Label>
            <select
              id="categoryID"
              value={categoryID}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#3d4457] rounded-lg bg-[#1f2330] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
            >
              <option value="">None</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="research">Research</option>
            </select>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-100 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-red-200 mb-4">
                Delete this project permanently. This action cannot be undone.
              </p>
              <Button variant="outline" className="border-red-400 text-red-400 hover:bg-red-900/30">
                Delete Project
              </Button>
            </div>
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
                  Save Settings
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
