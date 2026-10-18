import { useState } from 'react';
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from '../hooks/useAdminAnnouncements';
import { Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { notify } from '@/lib/toast';

export function Announcements() {
  const { data: announcements = [], isLoading } = useAdminAnnouncements();
  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'danger' | 'success'>('info');
  const [expiresAt, setExpiresAt] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      notify.error('Title and message are required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        type,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });

      setIsCreating(false);
      setTitle('');
      setMessage('');
      setType('info');
      setExpiresAt('');
    } catch {
      // Handled in mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this announcement?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-foreground tracking-tight">System Announcements</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              Broadcasts
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Broadcast emergency alerts, patch notes, or community notices to all players.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Announcement</span>
        </Button>
      </div>

      {/* Create Announcement Card */}
      {isCreating && (
        <Card className="bg-surface border-border">
          <Card.Header className="pb-3 border-b border-border">
            <span className="text-sm font-black text-foreground uppercase tracking-wider">
              Create Broadcast
            </span>
          </Card.Header>
          <Card.Body className="pt-4">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance Downtime"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Details and player instructions..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Type / Priority</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="info">Info (Standard Banner)</option>
                    <option value="warning">Warning (Notice)</option>
                    <option value="danger">Danger (Urgent Alert)</option>
                    <option value="success">Success (Celebration)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="text-xs"
                >
                  {createMutation.isPending ? 'Publishing...' : 'Publish Announcement'}
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-border rounded-2xl text-xs text-muted">
            No active announcements.
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-surface border border-border rounded-2xl flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground">{item.title}</span>
                  <Badge variant="ink" className="text-[10px] font-black uppercase py-0 px-1.5">
                    {item.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted whitespace-pre-wrap">{item.message}</p>
                <div className="text-[10px] text-subtle font-mono pt-1">
                  Posted on {new Date(item.createdAt).toLocaleString()}
                  {item.expiresAt && ` • Expires ${new Date(item.expiresAt).toLocaleString()}`}
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                disabled={deleteMutation.isPending}
                className="p-1.5 rounded-lg bg-surface-raised border border-border text-muted hover:text-danger transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
