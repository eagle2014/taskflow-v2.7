// Custom hook for phase management operations
import { useCallback } from 'react';
import { Phase } from '../types';
import { toast } from 'sonner';

interface UsePhaseManagementProps {
  activeProject: string | null;
  projectPhases: Record<string, Phase[]>;
  setProjectPhases: (phases: Record<string, Phase[]>) => void;
}

export const usePhaseManagement = ({
  activeProject,
  projectPhases,
  setProjectPhases,
}: UsePhaseManagementProps) => {
  
  // Add a new phase
  const addPhase = useCallback((phase: Phase) => {
    if (!activeProject) {
      toast.error('Please select a project first');
      return;
    }

    setProjectPhases({
      ...projectPhases,
      [activeProject]: [...(projectPhases[activeProject] || []), phase]
    });
    
    toast.success('Phase added successfully');
  }, [activeProject, projectPhases, setProjectPhases]);

  // Update a phase
  const updatePhase = useCallback((phaseId: string, updates: Partial<Phase>) => {
    if (!activeProject) return;

    const updatedPhases = projectPhases[activeProject]?.map(phase =>
      phase.id === phaseId ? { ...phase, ...updates } : phase
    );

    if (updatedPhases) {
      setProjectPhases({
        ...projectPhases,
        [activeProject]: updatedPhases
      });
      toast.success('Phase updated successfully');
    }
  }, [activeProject, projectPhases, setProjectPhases]);

  // Delete a phase
  const deletePhase = useCallback((phaseId: string) => {
    if (!activeProject) return;

    const updatedPhases = projectPhases[activeProject]?.filter(phase => phase.id !== phaseId);

    if (updatedPhases) {
      setProjectPhases({
        ...projectPhases,
        [activeProject]: updatedPhases
      });
      toast.success('Phase deleted successfully');
    }
  }, [activeProject, projectPhases, setProjectPhases]);

  // Reorder phases
  const reorderPhases = useCallback((startIndex: number, endIndex: number) => {
    if (!activeProject) return;

    const phases = Array.from(projectPhases[activeProject] || []);
    const [removed] = phases.splice(startIndex, 1);
    phases.splice(endIndex, 0, removed);

    setProjectPhases({
      ...projectPhases,
      [activeProject]: phases
    });
  }, [activeProject, projectPhases, setProjectPhases]);

  // Get phases for current project
  const getCurrentPhases = useCallback((): Phase[] => {
    if (!activeProject) return [];
    return projectPhases[activeProject] || [];
  }, [activeProject, projectPhases]);

  return {
    addPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
    getCurrentPhases,
  };
};
