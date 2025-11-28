import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { X } from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import {
  categoriesApi,
  Category,
  Project
} from '../services/api';
import { toast } from 'sonner';

interface NewProjectFormProps {
  onSave: (project: Partial<Project>) => void;
  onCancel: () => void;
  initialData?: Project;
}

export function NewProjectForm({ onSave, onCancel, initialData }: NewProjectFormProps) {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryID: initialData?.categoryID || '',
    priority: (initialData?.priority || 'medium') as 'low' | 'medium' | 'high',
    status: (initialData?.status || 'planning') as 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold',
    progress: initialData?.progress || 0,
    endDate: (initialData?.endDate) ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    createdBy: initialData?.createdBy || '',
    members: initialData?.members || [] as string[]
  });

  // Load categories
  useState(() => {
    categoriesApi.getAll().then(setCategories);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);
    try {
      const endDate = formData.endDate
        ? new Date(formData.endDate).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days from now

      onSave({
        name: formData.name,
        description: formData.description,
        categoryID: formData.categoryID,
        priority: formData.priority,
        status: formData.status,
        endDate: endDate,
        progress: 0,
        createdBy: '', // Will be set by parent component
        members: [] // Will be set by parent component
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-transparent border-0 w-full">
        <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
          <CardTitle className="text-white">{initialData ? 'Edit Project' : t('projects.createNew')}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                {t('projects.projectName')} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff]"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                {t('projects.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff] min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t('projects.category')}
                </label>
                <Select
                  value={formData.categoryID}
                  onValueChange={(value) => setFormData({ ...formData, categoryID: value })}
                >
                  <SelectTrigger className="bg-[#3d4457] border-[#3d4457] text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#292d39] border-[#3d4457]">
                    {categories.map((category) => (
                      <SelectItem key={category.categoryID} value={category.categoryID} className="text-white">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t('projects.priority')}
                </label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="bg-[#3d4457] border-[#3d4457] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#292d39] border-[#3d4457]">
                    <SelectItem value="low" className="text-white">{t('tasks.priority.low')}</SelectItem>
                    <SelectItem value="medium" className="text-white">{t('tasks.priority.medium')}</SelectItem>
                    <SelectItem value="high" className="text-white">{t('tasks.priority.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t('projects.status')}
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-[#3d4457] border-[#3d4457] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#292d39] border-[#3d4457]">
                    <SelectItem value="planning" className="text-white">Planning</SelectItem>
                    <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                    <SelectItem value="review" className="text-white">Review</SelectItem>
                    <SelectItem value="completed" className="text-white">Completed</SelectItem>
                    <SelectItem value="on_hold" className="text-white">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t('projects.dueDate')}
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-[#3d4457] border-[#3d4457] text-white focus:border-[#0394ff]"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-[#3d4457] border-[#3d4457] text-white hover:bg-[#4a5568]"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0394ff] hover:bg-[#0570cd] text-white"
              >
                {loading ? t('common.loading') : (initialData ? 'Update' : t('common.create'))}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}