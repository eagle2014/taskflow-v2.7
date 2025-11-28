import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  CalendarIcon,
  Users,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';

interface MindMapTask {
  id: string;
  name: string;
  status: 'todo' | 'in-progress' | 'ready' | 'done';
  dueDate?: string;
  assignee?: {
    name: string;
    initials: string;
    color: string;
  } | null;
  subtasks?: MindMapTask[];
}

interface MindMapPhase {
  id: string;
  name: string;
  color: string;
  tasks: MindMapTask[];
}

interface MindMapViewProps {
  projectName?: string;
  phases?: MindMapPhase[];
  tasks?: any[];
  onTaskClick?: (taskId: string) => void;
  onTaskDoubleClick?: (task: MindMapTask) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

export function MindMapView({ projectName = 'Project', phases = [], tasks, onTaskClick, onTaskDoubleClick }: MindMapViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate node positions
  const centerX = 600;
  const centerY = 400;
  const phaseRadius = 280;
  const taskRadius = 180;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate positions for phases
  const getPhasePosition = (index: number, total: number): NodePosition => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + phaseRadius * Math.cos(angle),
      y: centerY + phaseRadius * Math.sin(angle)
    };
  };

  // Calculate positions for tasks around a phase
  const getTaskPosition = (
    phasePos: NodePosition,
    taskIndex: number,
    totalTasks: number,
    phaseIndex: number,
    totalPhases: number
  ): NodePosition => {
    const baseAngle = (phaseIndex / totalPhases) * 2 * Math.PI - Math.PI / 2;
    const taskSpread = Math.PI / 3; // 60 degrees spread
    const startAngle = baseAngle - taskSpread / 2;
    const angle = startAngle + (taskIndex / Math.max(totalTasks - 1, 1)) * taskSpread;
    
    return {
      x: phasePos.x + taskRadius * Math.cos(angle),
      y: phasePos.y + taskRadius * Math.sin(angle)
    };
  };

  // Generate curved path between two points
  const getCurvedPath = (from: NodePosition, to: NodePosition): string => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    
    // Control point for curve
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const offset = dr * 0.2;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const controlX = midX + offset * Math.cos(angle);
    const controlY = midY + offset * Math.sin(angle);

    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'in-progress':
        return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'ready':
        return <Circle className="w-3 h-3 text-purple-400" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#10b981';
      case 'in-progress':
        return '#fbbf24';
      case 'ready':
        return '#7c66d9';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="h-full w-full bg-[#181c28] relative overflow-hidden" ref={containerRef}>
      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-[#292d39] border-[#3d4457] text-white hover:bg-[#3d4457]"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-[#292d39] border-[#3d4457] text-white hover:bg-[#3d4457]"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="bg-[#292d39] border-[#3d4457] text-white hover:bg-[#3d4457]"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-[#292d39] border border-[#3d4457] rounded px-3 py-1.5 text-xs text-white">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-[#292d39] border border-[#3d4457] rounded px-3 py-2 text-xs text-[#838a9c]">
          <p>Click and drag to pan • Use zoom controls • Click nodes for details</p>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Draw connections from center to phases */}
          {phases.map((phase, phaseIndex) => {
            const phasePos = getPhasePosition(phaseIndex, phases.length);
            return (
              <g key={`connection-phase-${phase.id}`}>
                <path
                  d={getCurvedPath({ x: centerX, y: centerY }, phasePos)}
                  stroke={phase.color}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.4"
                  strokeDasharray="5,5"
                />
              </g>
            );
          })}

          {/* Draw connections from phases to tasks */}
          {phases.map((phase, phaseIndex) => {
            const phasePos = getPhasePosition(phaseIndex, phases.length);
            return phase.tasks.map((task, taskIndex) => {
              const taskPos = getTaskPosition(phasePos, taskIndex, phase.tasks.length, phaseIndex, phases.length);
              return (
                <path
                  key={`connection-task-${task.id}`}
                  d={getCurvedPath(phasePos, taskPos)}
                  stroke={phase.color}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.3"
                />
              );
            });
          })}

          {/* Center Node - Project */}
          <g>
            <circle
              cx={centerX}
              cy={centerY}
              r="80"
              fill="#0394ff"
              stroke="#0570cd"
              strokeWidth="3"
              className="drop-shadow-lg"
            />
            <foreignObject
              x={centerX - 70}
              y={centerY - 30}
              width="140"
              height="60"
              className="pointer-events-none"
            >
              <div className="flex flex-col items-center justify-center h-full text-center px-2">
                <div className="text-white text-sm font-semibold leading-tight">
                  {projectName}
                </div>
                <div className="text-white/70 text-xs mt-1">
                  {phases.reduce((sum, p) => sum + p.tasks.length, 0)} tasks
                </div>
              </div>
            </foreignObject>
          </g>

          {/* Phase Nodes */}
          {phases.map((phase, phaseIndex) => {
            const pos = getPhasePosition(phaseIndex, phases.length);
            const isSelected = selectedNode === `phase-${phase.id}`;
            
            return (
              <g 
                key={`phase-${phase.id}`}
                onClick={() => setSelectedNode(`phase-${phase.id}`)}
                className="cursor-pointer"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? "65" : "60"}
                  fill={phase.color}
                  stroke={isSelected ? "#ffffff" : phase.color}
                  strokeWidth={isSelected ? "3" : "2"}
                  opacity="0.9"
                  className="transition-all duration-200"
                  filter="url(#shadow)"
                />
                <foreignObject
                  x={pos.x - 55}
                  y={pos.y - 40}
                  width="110"
                  height="80"
                  className="pointer-events-none"
                >
                  <div className="flex flex-col items-center justify-center h-full text-center px-2">
                    <div className="text-white text-xs font-semibold leading-tight mb-1">
                      {phase.name}
                    </div>
                    <div className="bg-white/20 rounded-full px-2 py-0.5">
                      <div className="text-white text-xs">
                        {phase.tasks.length} tasks
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Task Nodes */}
          {phases.map((phase, phaseIndex) => {
            const phasePos = getPhasePosition(phaseIndex, phases.length);
            
            return phase.tasks.map((task, taskIndex) => {
              const pos = getTaskPosition(phasePos, taskIndex, phase.tasks.length, phaseIndex, phases.length);
              const isSelected = selectedNode === `task-${task.id}`;
              const statusColor = getStatusColor(task.status);
              
              return (
                <g 
                  key={`task-${task.id}`}
                  onClick={() => {
                    setSelectedNode(`task-${task.id}`);
                    onTaskClick?.(task.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onTaskDoubleClick?.(task);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={pos.x - 60}
                    y={pos.y - 35}
                    width="120"
                    height="70"
                    rx="8"
                    fill="#292d39"
                    stroke={isSelected ? "#0394ff" : "#3d4457"}
                    strokeWidth={isSelected ? "2" : "1"}
                    className="transition-all duration-200"
                    filter="url(#shadow)"
                  />
                  
                  {/* Status indicator */}
                  <rect
                    x={pos.x - 60}
                    y={pos.y - 35}
                    width="4"
                    height="70"
                    rx="8"
                    fill={statusColor}
                  />
                  
                  <foreignObject
                    x={pos.x - 55}
                    y={pos.y - 30}
                    width="110"
                    height="60"
                    className="pointer-events-none"
                  >
                    <div className="flex flex-col h-full p-1.5">
                      <div className="text-white text-xs leading-tight mb-1 line-clamp-2">
                        {task.name}
                      </div>
                      <div className="flex items-center gap-1 mt-auto">
                        {task.assignee && (
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: task.assignee.color, fontSize: '8px' }}
                          >
                            {task.assignee.initials}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="text-[10px] text-[#838a9c] flex items-center gap-0.5">
                            <CalendarIcon className="w-2.5 h-2.5" />
                            {task.dueDate}
                          </div>
                        )}
                      </div>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="text-[10px] text-[#838a9c] mt-0.5">
                          {task.subtasks.length} subtasks
                        </div>
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            });
          })}

          {/* SVG Filters */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-[#292d39] border border-[#3d4457] rounded px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-white">Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-white">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span className="text-xs text-white">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs text-white">To Do</span>
          </div>
        </div>
      </div>
    </div>
  );
}
