import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { GripVertical } from 'lucide-react';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface DraggableTaskRowProps {
  id: string;
  index: number;
  children: React.ReactNode;
  onMoveTask: (dragIndex: number, hoverIndex: number) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

const TASK_TYPE = 'task-row';

export function DraggableTaskRow({
  id,
  index,
  children,
  onMoveTask,
  onDragEnd,
  disabled = false
}: DraggableTaskRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: TASK_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMoveTask(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: TASK_TYPE,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      if (onDragEnd) {
        onDragEnd();
      }
    },
    canDrag: !disabled,
  });

  const opacity = isDragging ? 0.4 : 1;

  // Connect drag and drop refs
  preview(drop(ref));

  return (
    <tr
      ref={ref}
      data-handler-id={handlerId}
      style={{ opacity }}
      className={`border-b border-[#3a3f4f] hover:bg-[#292d39] transition-colors cursor-pointer group ${
        isDragging ? 'bg-[#292d39]' : ''
      }`}
    >
      {/* Drag handle column */}
      <td className="p-3 w-8" onClick={(e) => e.stopPropagation()}>
        <div
          ref={drag}
          className={`cursor-move text-gray-500 hover:text-gray-300 ${
            disabled ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <GripVertical size={16} />
        </div>
      </td>
      {children}
    </tr>
  );
}
