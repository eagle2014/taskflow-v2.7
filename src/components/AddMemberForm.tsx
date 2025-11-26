import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { X, User, Mail, Building, MapPin, Phone, Calendar, Target } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Project {
  id: string;
  name: string;
}

interface AddMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
}

export function AddMemberForm({ isOpen, onClose, onMemberAdded }: AddMemberFormProps) {
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    role: '',
    department: '',
    location: '',
    phone: '',
    status: 'active',
    assignedProject: ''
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const departments = [
    'Product',
    'Engineering', 
    'Design',
    'Quality Assurance',
    'Infrastructure',
    'Marketing',
    'Sales'
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'busy', label: 'Busy' },
    { value: 'away', label: 'Away' },
    { value: 'offline', label: 'Offline' }
  ];

  // Load projects when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8837ac96/projects`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        console.log('Failed to load projects from server');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateUserId = () => {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'role', 'department'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in required fields: ${missing.join(', ')}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const memberData = {
        ...formData,
        userId: formData.userId || generateUserId(),
        joinDate: new Date().toISOString().split('T')[0],
        avatar: formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8837ac96/team-members`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData),
        }
      );

      if (response.ok) {
        toast.success('Team member added successfully!');
        setFormData({
          userId: '',
          fullName: '',
          email: '',
          role: '',
          department: '',
          location: '',
          phone: '',
          status: 'active',
          assignedProject: ''
        });
        onMemberAdded();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      userId: '',
      fullName: '',
      email: '',
      role: '',
      department: '',
      location: '',
      phone: '',
      status: 'active',
      assignedProject: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-[#0394ff]" />
            Add New Team Member
          </DialogTitle>
          <DialogDescription className="text-[#838a9c]">
            Fill in the information below to add a new team member to your workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#0394ff] uppercase tracking-wide">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-white">
                  User ID <span className="text-[#838a9c] text-sm">(optional)</span>
                </Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="bg-[#3d4457] border-[#4a5568] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                  className="bg-[#3d4457] border-[#4a5568] text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c]" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="bg-[#3d4457] border-[#4a5568] text-white pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#0394ff] uppercase tracking-wide">Role & Department</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">
                  Role <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="e.g. Senior Developer"
                  className="bg-[#3d4457] border-[#4a5568] text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-white">
                  Department <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger className="bg-[#3d4457] border-[#4a5568] text-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#292d39] border-[#3d4457]">
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-white hover:bg-[#3d4457]">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#0394ff] uppercase tracking-wide">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c]" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. Ho Chi Minh City, VN"
                    className="bg-[#3d4457] border-[#4a5568] text-white pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c]" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. +84 901 234 567"
                    className="bg-[#3d4457] border-[#4a5568] text-white pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#0394ff] uppercase tracking-wide">Status & Assignment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="bg-[#3d4457] border-[#4a5568] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#292d39] border-[#3d4457]">
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value} className="text-white hover:bg-[#3d4457]">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedProject" className="text-white">Assigned Project</Label>
                <Select 
                  value={formData.assignedProject || "none"} 
                  onValueChange={(value) => handleInputChange('assignedProject', value === "none" ? "" : value)}
                  disabled={isLoadingProjects}
                >
                  <SelectTrigger className="bg-[#3d4457] border-[#4a5568] text-white">
                    <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select project (optional)"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#292d39] border-[#3d4457]">
                    <SelectItem value="none" className="text-white hover:bg-[#3d4457]">
                      No project assigned
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id} className="text-white hover:bg-[#3d4457]">
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t border-[#3d4457]">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-[#4a5568] text-[#838a9c] hover:bg-[#3d4457] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
            >
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}