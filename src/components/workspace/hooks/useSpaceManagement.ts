// Custom hook for space management operations
import { useCallback } from 'react';
import { Space } from '../types';
import { toast } from 'sonner';

interface UseSpaceManagementProps {
  spaces: Space[];
  setSpaces: (spaces: Space[]) => void;
}

export const useSpaceManagement = ({
  spaces,
  setSpaces,
}: UseSpaceManagementProps) => {
  
  // Add a new space
  const addSpace = useCallback((space: Space) => {
    setSpaces([...spaces, space]);
    toast.success('Space added successfully');
  }, [spaces, setSpaces]);

  // Update a space
  const updateSpace = useCallback((spaceId: string, updates: Partial<Space>) => {
    const updatedSpaces = spaces.map(space =>
      space.id === spaceId ? { ...space, ...updates } : space
    );
    
    setSpaces(updatedSpaces);
    toast.success('Space updated successfully');
  }, [spaces, setSpaces]);

  // Delete a space
  const deleteSpace = useCallback((spaceId: string) => {
    const updatedSpaces = spaces.filter(space => space.id !== spaceId);
    setSpaces(updatedSpaces);
    toast.success('Space deleted successfully');
  }, [spaces, setSpaces]);

  // Add project to space
  const addProjectToSpace = useCallback((spaceId: string, projectId: string) => {
    const updatedSpaces = spaces.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          projectIds: [...(space.projectIds || []), projectId]
        };
      }
      return space;
    });
    
    setSpaces(updatedSpaces);
  }, [spaces, setSpaces]);

  // Remove project from space
  const removeProjectFromSpace = useCallback((spaceId: string, projectId: string) => {
    const updatedSpaces = spaces.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          projectIds: (space.projectIds || []).filter(id => id !== projectId)
        };
      }
      return space;
    });
    
    setSpaces(updatedSpaces);
  }, [spaces, setSpaces]);

  // Get space by ID
  const getSpaceById = useCallback((spaceId: string): Space | undefined => {
    return spaces.find(space => space.id === spaceId);
  }, [spaces]);

  // Get spaces containing a specific project
  const getSpacesForProject = useCallback((projectId: string): Space[] => {
    return spaces.filter(space => 
      space.projectIds && space.projectIds.includes(projectId)
    );
  }, [spaces]);

  return {
    addSpace,
    updateSpace,
    deleteSpace,
    addProjectToSpace,
    removeProjectFromSpace,
    getSpaceById,
    getSpacesForProject,
  };
};
