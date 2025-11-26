import { Card } from './ui/card';
import { BarChart3 } from 'lucide-react';

export function Workload() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Workload</h1>
        <p className="text-[#838a9c] mt-1">Team capacity and workload management</p>
      </div>

      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <div className="text-center text-[#838a9c] py-20">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Workload capacity view will be implemented here</p>
          <p className="text-sm mt-2">Team member capacity, overload indicators, and reassignment suggestions</p>
        </div>
      </Card>
    </div>
  );
}