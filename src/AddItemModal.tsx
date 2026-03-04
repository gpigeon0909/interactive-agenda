import { useEffect, useState } from 'react';
import type { AgendaItem } from './types';
import { ITEM_PRESET_COLORS, QUICK_EMOJIS } from './types';
import './AddItemModal.css';

export type ModalTarget = { dateKey: string; editIndex?: number };

type AddItemModalProps = {
  isOpen: boolean;
  target: ModalTarget | null;
  initialItem?: AgendaItem | null;
  dayLabel: string;
  onClose: () => void;
  onSave: (item: Omit<AgendaItem, 'id'> & { id?: string }) => void;
};

export function AddItemModal({
  isOpen,
  initialItem,
  dayLabel,
  onClose,
  onSave,
}: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setTitle(initialItem.title);
      setDescription(initialItem.description ?? '');
      setColor(initialItem.color ?? '');
      setEmoji(initialItem.emoji ?? '');
    } else {
      setTitle('');
      setDescription('');
      setColor('');
      setEmoji('');
    }
  }, [isOpen, initialItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSave({
      ...(initialItem?.id && { id: initialItem.id }),
      title: t,
      description: description.trim() || undefined,
      color: color || undefined,
      emoji: emoji.trim() || undefined,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title">{initialItem ? 'Edit item' : 'Add item'} — {dayLabel}</h2>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="modal-field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on the agenda?"
              required
              autoFocus
            />
          </label>
          <label className="modal-field">
            <span>Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </label>
          <div className="modal-field">
            <span>Background color (optional)</span>
            <div className="color-swatches">
              <button
                type="button"
                className={`color-swatch ${!color ? 'color-swatch--none' : ''} ${color === '' ? 'color-swatch--selected' : ''}`}
                onClick={() => setColor('')}
                title="No color"
                aria-label="No background color"
              />
              {ITEM_PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${color === c ? 'color-swatch--selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <input
              type="color"
              value={color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#fef3c7'}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
              title="Custom color"
            />
          </div>
          <div className="modal-field">
            <span>Emoji (optional)</span>
            <div className="emoji-row">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-btn ${emoji === e ? 'emoji-btn--selected' : ''}`}
                  onClick={() => setEmoji((prev) => (prev === e ? '' : e))}
                  aria-label={`Pick ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Or type/paste any emoji"
              className="emoji-input"
              maxLength={4}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              {initialItem ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
