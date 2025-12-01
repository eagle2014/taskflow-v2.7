import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Loader2, Palette } from 'lucide-react';
import { phasesApi, projectsApi, CreatePhaseRequest } from '../services/api';
import { toast } from 'sonner';

interface AddPhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onPhaseCreated?: (phase: any) => void;
}

const PHASE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
];

export function AddPhaseDialog({ open, onOpenChange, projectId, onPhaseCreated }: AddPhaseDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PHASE_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loadingProject, setLoadingProject] = useState(false);

  // Load project name for display
  useEffect(() => {
    const loadProjectName = async () => {
      if (!projectId || !open) return;
      setLoadingProject(true);
      try {
        const project = await projectsApi.getById(projectId);
        setProjectName(project.name);
      } catch (error) {
        console.error('Failed to load project:', error);
        setProjectName('Unknown Project');
      } finally {
        setLoadingProject(false);
      }
    };
    loadProjectName();
  }, [projectId, open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setColor(PHASE_COLORS[Math.floor(Math.random() * PHASE_COLORS.length)]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Phase name is required');
      return;
    }

    if (!projectId) {
      toast.error('Project ID is missing');
      return;
    }

    setSaving(true);
    try {
      const phaseData: CreatePhaseRequest = {
        projectID: projectId,
        name: name.trim(),
        description: description.trim() || undefined,
        color: color,
      };

      const newPhase = await phasesApi.create(phaseData);
      toast.success(`Phase "${name}" created successfully`);
      onPhaseCreated?.(newPhase);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create phase:', error);
      toast.error('Failed to create phase. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Create New Phase</DialogTitle>
          <DialogDescription className="text-[#838a9c]">
            {loadingProject ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading project...
              </span>
            ) : (
              <>Add a new phase to <span className="text-[#0394ff] font-medium">{projectName}</span></>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Phase Name */}
          <div className="space-y-2">
            <Label htmlFor="phase-name" className="text-white text-sm">
              Phase Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="phase-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Phase 1 - Planning"
              className="bg-[#181c28] border-[#3d4457] text-white placeholder:text-[#838a9c]"
              autoFocus
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="phase-description" className="text-white text-sm">
              Description
            </Label>
            <Textarea
              id="phase-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this phase..."
              rows={3}
              className="bg-[#181c28] border-[#3d4457] text-white placeholder:text-[#838a9c] resize-none"
              disabled={saving}
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="text-white text-sm flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Phase Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {PHASE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#292d39] scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  disabled={saving}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#181c28] rounded-lg p-3 border border-[#3d4457]">
            <Label className="text-[#838a9c] text-xs mb-2 block">Preview</Label>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-white text-sm">{name || 'Phase Name'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="border-[#3d4457] text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !name.trim()}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Phase'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
