import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Database, Loader2 } from 'lucide-react';
import { User } from '../services/api';

interface TaskSeederProps {
  currentUser: User | null;
}

export function TaskSeeder({ currentUser }: TaskSeederProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedData = async () => {
    if (!currentUser) {
      setMessage('Please login first');
      return;
    }

    setIsSeeding(true);
    setMessage('');

    try {
      // Call backend seeding endpoint (if exists)
      const response = await fetch('http://localhost:5001/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('taskflow_access_token')}`
        }
      });

      if (response.ok) {
        setMessage('✅ Sample data seeded successfully!');
      } else {
        setMessage('❌ Seeding failed. Backend endpoint may not be available.');
      }
    } catch (error) {
      setMessage('❌ Error: Backend seeding endpoint not available. Data already seeded in database initialization.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Seeding
        </CardTitle>
        <CardDescription>
          Seed sample data for testing and development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Sample data has been seeded during database initialization:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>2 Sites (ACME, TECHSTART)</li>
            <li>6 Users with different roles</li>
            <li>3 Project Categories</li>
            <li>3 Projects with phases and tasks</li>
            <li>5 Tasks with comments</li>
            <li>4 Calendar Events</li>
            <li>2 Workspaces</li>
          </ul>
        </div>

        <Button
          onClick={handleSeedData}
          disabled={isSeeding || !currentUser}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Reseed Sample Data
            </>
          )}
        </Button>

        {message && (
          <div className={`text-sm p-3 rounded ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {message}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> Sample data is automatically created when you run <code>init-database-simple.ps1</code>
        </div>
      </CardContent>
    </Card>
  );
}