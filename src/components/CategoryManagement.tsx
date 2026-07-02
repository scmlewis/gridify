import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { getCategories, updateCategories } from '../db';
import type { Category } from '../db';

interface CategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#6366f1', '#2ba8a2', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#10b981', '#f97316', '#3b82f6', '#14b8a6',
];

export function CategoryManagement({ isOpen, onClose }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    if (isOpen) {
      getCategories().then(setCategories);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const save = async (updated: Category[]) => {
    await updateCategories(updated);
    setCategories(updated);
  };

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const newCat: Category = { id: nanoid(), name: trimmed, color: newColor };
    await save([...categories, newCat]);
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
  };

  const handleDelete = async (id: string) => {
    await save(categories.filter((c) => c.id !== id));
  };

  const handleRename = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    await save(categories.map((c) => (c.id === id ? { ...c, name: trimmed, color: editColor } : c)));
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-surface-card border border-border shadow-2xl p-5 space-y-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Manage Categories</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add new category */}
        <div className="flex gap-2 items-center">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="New category name…"
            className="flex-1 rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
          <div className="flex items-center gap-1">
            {PRESET_COLORS.slice(0, 5).map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => setNewColor(c)}
                className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: newColor === c ? '2px solid white' : 'none',
                  outlineOffset: '1px',
                }}
              />
            ))}
          </div>
          <button
            onClick={handleAdd}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-surface-base hover:opacity-90 transition-opacity shadow-teal-glow min-h-[40px]"
          >
            Add
          </button>
        </div>

        {/* Categories list */}
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {categories.length === 0 && (
            <li className="text-center text-sm text-text-muted py-4">No categories yet. Add one above!</li>
          )}
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-2 rounded-lg bg-surface-elevated px-3 py-2">
              {editingId === cat.id ? (
                <>
                  <div className="flex items-center gap-1 shrink-0">
                    {PRESET_COLORS.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => setEditColor(c)}
                        className="h-4 w-4 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          outline: editColor === c ? '2px solid white' : 'none',
                          outlineOffset: '1px',
                        }}
                      />
                    ))}
                  </div>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(cat.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 rounded bg-surface-card border border-border px-2 py-0.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                  />
                  <button onClick={() => handleRename(cat.id)} className="text-xs text-primary font-semibold hover:opacity-80">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-text-muted hover:opacity-80">Cancel</button>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm text-text-primary">{cat.name}</span>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color); }}
                    className="text-xs text-text-muted hover:text-primary transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-xs text-text-muted hover:text-coral transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
