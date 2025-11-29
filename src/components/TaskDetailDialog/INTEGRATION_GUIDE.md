# Activity Sidebar Integration Guide

## Quick Start

### Step 1: Import Components

```tsx
import { ActivityHeader } from './components/ActivityHeader';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CommentInput } from './components/CommentInput';
import type { Activity } from './types';
```

### Step 2: Add Activity State

```tsx
const [activities, setActivities] = useState<Activity[]>([
  {
    id: '1',
    type: 'created',
    user: {
      name: 'You',
      initials: 'YU',
      color: 'bg-purple-500',
    },
    timestamp: new Date(),
    content: 'created this task',
  },
]);
```

### Step 3: Integrate into TaskDetailDialog

```tsx
<DialogContent className="max-w-6xl h-[90vh] p-0">
  <div className="flex h-full">
    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      <TaskHeader task={task} onClose={onClose} />
      <div className="flex-1 overflow-y-auto">
        <TaskMetadata task={task} />
        <TaskDescription task={task} />
        <TaskTabs task={task} />
      </div>
    </div>

    {/* Activity Sidebar */}
    <div className="w-80 border-l border-gray-200 flex flex-col bg-gray-50">
      <ActivityHeader />
      <div className="flex-1 overflow-y-auto">
        <ActivityTimeline activities={activities} />
      </div>
      <CommentInput onSubmit={handleCommentSubmit} />
    </div>
  </div>
</DialogContent>
```

### Step 4: Implement Comment Handler

```tsx
const handleCommentSubmit = (content: string) => {
  const newActivity: Activity = {
    id: crypto.randomUUID(),
    type: 'commented',
    user: {
      name: 'You',
      initials: 'YU',
      color: 'bg-purple-500',
    },
    timestamp: new Date(),
    content,
  };

  setActivities([...activities, newActivity]);

  // TODO: Call API to save comment
  // api.comments.create({ taskId: task.id, content });
};
```

## Activity Types Reference

```typescript
type ActivityType =
  | 'created'        // Task creation
  | 'updated'        // Task field updates
  | 'estimated'      // Time estimation changes
  | 'commented'      // Comments added
  | 'status_changed' // Status transitions
  | 'assigned'       // Assignee changes
  | 'attached';      // File attachments
```

## Activity Content Examples

```typescript
// Created
{ type: 'created', content: 'created this task' }

// Estimated
{ type: 'estimated', content: '8 weeks' }

// Status Changed
{ type: 'status_changed', content: 'In Progress' }

// Assigned
{ type: 'assigned', content: 'John Doe' }

// Commented
{ type: 'commented', content: 'This looks good!' }

// Attached
{ type: 'attached', content: 'design-mockup.png' }
```

## Timestamp Formatting

The ActivityTimeline component automatically formats timestamps:

```typescript
// Input: new Date('2021-06-15T22:44:00')
// Output: "jun 15 2021 at 10:44pm"
```

Format details:
- Month: Short name (jan, feb, mar...)
- Day: Numeric (1-31)
- Year: Full (2021, 2022...)
- Time: 12-hour with am/pm
- All lowercase

## API Integration

### Fetch Activities

```typescript
useEffect(() => {
  const fetchActivities = async () => {
    const response = await api.get(`/tasks/${taskId}/activities`);
    setActivities(response.data);
  };

  fetchActivities();
}, [taskId]);
```

### Create Comment

```typescript
const handleCommentSubmit = async (content: string) => {
  try {
    const response = await api.post(`/tasks/${taskId}/comments`, {
      content,
      mentions: extractMentions(content),
    });

    // Add to local state
    const newActivity: Activity = {
      id: response.data.id,
      type: 'commented',
      user: currentUser,
      timestamp: new Date(response.data.createdAt),
      content: response.data.content,
    };

    setActivities([...activities, newActivity]);
  } catch (error) {
    console.error('Failed to create comment:', error);
    // Show error toast
  }
};
```

### Extract Mentions

```typescript
const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};
```

## Real-time Updates

### WebSocket Integration

```typescript
useEffect(() => {
  const ws = new WebSocket(`ws://api.example.com/tasks/${taskId}/activities`);

  ws.onmessage = (event) => {
    const newActivity: Activity = JSON.parse(event.data);
    setActivities((prev) => [...prev, newActivity]);
  };

  return () => ws.close();
}, [taskId]);
```

### Polling Integration

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await api.get(`/tasks/${taskId}/activities`);
    setActivities(response.data);
  }, 30000); // Poll every 30 seconds

  return () => clearInterval(interval);
}, [taskId]);
```

## Error Handling

### Failed Comment Submission

```typescript
const handleCommentSubmit = async (content: string) => {
  // Optimistic update
  const tempActivity: Activity = {
    id: 'temp-' + Date.now(),
    type: 'commented',
    user: currentUser,
    timestamp: new Date(),
    content,
  };

  setActivities([...activities, tempActivity]);

  try {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });

    // Replace temp with real activity
    setActivities((prev) =>
      prev.map((a) => (a.id === tempActivity.id ? response.data : a))
    );
  } catch (error) {
    // Remove temp activity on error
    setActivities((prev) => prev.filter((a) => a.id !== tempActivity.id));
    showErrorToast('Failed to post comment');
  }
};
```

## Accessibility

### Keyboard Navigation

The Activity Sidebar supports:
- **Tab**: Navigate between input and buttons
- **Cmd/Ctrl+Enter**: Submit comment
- **Esc**: Close dialog
- **Arrow keys**: Navigate dropdown menus

### Screen Reader Support

All components include:
- ARIA labels on icon buttons
- Semantic HTML structure
- Live region announcements for new activities

### Focus Management

```typescript
const textareaRef = useRef<HTMLTextAreaElement>(null);

// Focus comment input when sidebar opens
useEffect(() => {
  textareaRef.current?.focus();
}, []);
```

## Performance Optimization

### Virtual Scrolling

For tasks with 100+ activities, implement virtual scrolling:

```typescript
import { VariableSizeList } from 'react-window';

<VariableSizeList
  height={500}
  itemCount={activities.length}
  itemSize={(index) => 80} // Approximate height
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ActivityItem activity={activities[index]} />
    </div>
  )}
</VariableSizeList>
```

### Memoization

```typescript
import { memo } from 'react';

const ActivityTimeline = memo(({ activities }: ActivityTimelineProps) => {
  // Component implementation
});
```

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { ActivityTimeline } from './ActivityTimeline';

describe('ActivityTimeline', () => {
  it('renders activities', () => {
    const activities = [
      {
        id: '1',
        type: 'created',
        user: { name: 'John', initials: 'JD', color: 'bg-blue-500' },
        timestamp: new Date(),
        content: 'created this task',
      },
    ];

    render(<ActivityTimeline activities={activities} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<ActivityTimeline activities={[]} />);
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react';
import { CommentInput } from './CommentInput';

describe('CommentInput', () => {
  it('submits comment on Cmd+Enter', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText } = render(<CommentInput onSubmit={onSubmit} />);

    const textarea = getByPlaceholderText(/Mention @Brain/);
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('Test comment');
    });
  });
});
```

## Troubleshooting

### Activities Not Displaying

1. Check `activities` prop is defined
2. Verify timestamp is valid Date object
3. Check console for TypeScript errors
4. Ensure parent container has height

### Comment Input Not Resizing

1. Verify textarea has `resize-none` class
2. Check `useEffect` dependency array
3. Ensure parent allows flex growth

### Keyboard Shortcuts Not Working

1. Check event handlers are attached
2. Verify `metaKey`/`ctrlKey` detection
3. Test in different browsers (Mac/Windows)

## Common Patterns

### Track Last Viewed Activity

```typescript
const [lastViewedId, setLastViewedId] = useState<string | null>(null);

useEffect(() => {
  // Mark activities as read when sidebar opens
  setLastViewedId(activities[activities.length - 1]?.id);
}, [activities]);

// Show "new" badge on unread activities
const isNew = activity.id > (lastViewedId || '');
```

### Filter Activities

```typescript
const [filter, setFilter] = useState<'all' | 'comments' | 'changes'>('all');

const filteredActivities = activities.filter((activity) => {
  if (filter === 'comments') return activity.type === 'commented';
  if (filter === 'changes') return activity.type !== 'commented';
  return true;
});
```

---

**Ready to integrate!** Copy-paste the Quick Start code and customize as needed.
