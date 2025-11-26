import { Card } from './ui/card';
import { Calendar } from 'lucide-react';

export function Timeline() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Timeline</h1>
        <p className="text-[#838a9c] mt-1">Gantt chart view of project timelines</p>
      </div>

      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <div className="text-center text-[#838a9c] py-20">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Gantt chart timeline will be implemented here</p>
          <p className="text-sm mt-2">Project dependencies, critical path, and milestones</p>
        </div>
      </Card>
    </div>
  );
}