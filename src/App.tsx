import { useCallback, useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import {
  formatDateKey,
  formatDayLabel,
  getMonday,
  getWeekDates,
} from './utils/week';
import type { AgendaItem, WeekItems } from './types';
import { AddItemModal, type ModalTarget } from './AddItemModal';
import './App.css';

const STORAGE_KEY = 'interactive-agenda-week';

function migrateItems(raw: unknown): WeekItems {
  if (!raw || typeof raw !== 'object') return {};
  const items = raw as Record<string, unknown>;
  const out: WeekItems = {};
  for (const [dateKey, arr] of Object.entries(items)) {
    if (!Array.isArray(arr)) continue;
    out[dateKey] = arr.map((entry): AgendaItem => {
      if (typeof entry === 'string') {
        return {
          id: crypto.randomUUID?.() ?? `${dateKey}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: entry,
        };
      }
      if (entry && typeof entry === 'object' && 'title' in entry) {
        const e = entry as Record<string, unknown>;
        return {
          id: (e.id as string) ?? crypto.randomUUID?.() ?? `${dateKey}-${Date.now()}`,
          title: String(e.title),
          description: e.description != null ? String(e.description) : undefined,
          color: e.color != null ? String(e.color) : undefined,
          emoji: e.emoji != null ? String(e.emoji) : undefined,
        };
      }
      return {
        id: crypto.randomUUID?.() ?? `${dateKey}-${Date.now()}`,
        title: String(entry),
      };
    });
  }
  return out;
}

function loadStored(): { weekStart: string; items: WeekItems } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { weekStart?: string; items?: unknown };
    const weekStart = data.weekStart;
    if (!weekStart || typeof weekStart !== 'string') return null;
    return {
      weekStart,
      items: migrateItems(data.items),
    };
  } catch {
    return null;
  }
}

function saveStored(weekStart: Date, items: WeekItems) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        weekStart: formatDateKey(weekStart),
        items,
      })
    );
  } catch {
    // ignore
  }
}

function App() {
  const today = getMonday(new Date());
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const stored = loadStored();
    if (stored) {
      const d = new Date(stored.weekStart);
      if (!isNaN(d.getTime())) return d;
    }
    return today;
  });
  const [items, setItems] = useState<WeekItems>(() => {
    const stored = loadStored();
    return stored?.items ?? {};
  });
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);
  const weekRef = useRef<HTMLDivElement>(null);

  const weekDates = getWeekDates(weekStart);

  useEffect(() => {
    saveStored(weekStart, items);
  }, [weekStart, items]);

  const addOrUpdateItem = useCallback((dateKey: string, item: Omit<AgendaItem, 'id'> & { id?: string }, editIndex?: number) => {
    const id = item.id ?? crypto.randomUUID?.() ?? `${dateKey}-${Date.now()}`;
    const newItem: AgendaItem = {
      id,
      title: item.title,
      description: item.description,
      color: item.color,
      emoji: item.emoji,
    };
    setItems((prev) => {
      const list = prev[dateKey] ?? [];
      if (typeof editIndex === 'number' && editIndex >= 0 && editIndex < list.length) {
        const next = [...list];
        next[editIndex] = newItem;
        return { ...prev, [dateKey]: next };
      }
      return { ...prev, [dateKey]: [...list, newItem] };
    });
  }, []);

  const removeItem = useCallback((dateKey: string, index: number) => {
    setItems((prev) => {
      const list = prev[dateKey] ?? [];
      const next = list.filter((_, i) => i !== index);
      if (next.length === 0) {
        const { [dateKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dateKey]: next };
    });
  }, []);

  const goPrevWeek = useCallback(() => {
    setWeekStart((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() - 7);
      return next;
    });
  }, []);

  const goNextWeek = useCallback(() => {
    setWeekStart((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() + 7);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getMonday(new Date()));
  }, []);

  const handleSavePdf = useCallback(async () => {
    const el = weekRef.current;
    if (!el) return;
    const filename = `week-${formatDateKey(weekStart)}.pdf`;
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
    };
    try {
      await html2pdf().set(opt).from(el).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  }, [weekStart]);

  const weekLabel =
    weekStart.getMonth() === weekDates[6].getMonth()
      ? `${formatDayLabel(weekStart)} – ${formatDayLabel(weekDates[6])}, ${weekStart.getFullYear()}`
      : `${formatDayLabel(weekStart)} – ${formatDayLabel(weekDates[6])}`;

  const modalDate = modalTarget ? weekDates.find((d) => formatDateKey(d) === modalTarget.dateKey) : null;
  const modalDayLabel = modalDate ? formatDayLabel(modalDate) : '';
  const initialItem =
    modalTarget && typeof modalTarget.editIndex === 'number'
      ? items[modalTarget.dateKey]?.[modalTarget.editIndex]
      : null;

  return (
    <div className="app">
      <header className="header">
        <div className="header-nav">
          <button type="button" onClick={goPrevWeek} className="btn-nav" aria-label="Previous week">
            ←
          </button>
          <h1 className="title">{weekLabel}</h1>
          <button type="button" onClick={goNextWeek} className="btn-nav" aria-label="Next week">
            →
          </button>
        </div>
        <div className="header-actions">
          <button type="button" onClick={goToToday} className="btn-secondary">
            This week
          </button>
          <button type="button" onClick={handleSavePdf} className="btn-primary">
            Save as PDF
          </button>
        </div>
      </header>

      <div ref={weekRef} className="week-view">
        {weekDates.map((date) => {
          const dateKey = formatDateKey(date);
          const dayItems = items[dateKey] ?? [];
          return (
            <DayColumn
              key={dateKey}
              date={date}
              items={dayItems}
              onAddClick={() => setModalTarget({ dateKey })}
              onEditClick={(index) => setModalTarget({ dateKey, editIndex: index })}
              onRemove={(index) => removeItem(dateKey, index)}
            />
          );
        })}
      </div>

      <AddItemModal
        isOpen={modalTarget !== null}
        target={modalTarget}
        initialItem={initialItem ?? null}
        dayLabel={modalDayLabel}
        onClose={() => setModalTarget(null)}
        onSave={(item) => {
          if (modalTarget) {
            addOrUpdateItem(modalTarget.dateKey, item, modalTarget.editIndex);
          }
          setModalTarget(null);
        }}
      />
    </div>
  );
}

type DayColumnProps = {
  date: Date;
  items: AgendaItem[];
  onAddClick: () => void;
  onEditClick: (index: number) => void;
  onRemove: (index: number) => void;
};

function DayColumn({ date, items, onAddClick, onEditClick, onRemove }: DayColumnProps) {
  const isToday = formatDateKey(date) === formatDateKey(new Date());

  return (
    <section className={`day-column ${isToday ? 'day-column--today' : ''}`}>
      <h2 className="day-title">
        <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
        <span className="day-date">{formatDayLabel(date)}</span>
      </h2>
      <ul className="day-list">
        {items.map((item, i) => (
          <li key={item.id} className="day-item-wrap">
            <button
              type="button"
              className="day-item"
              onClick={() => onEditClick(i)}
              style={item.color ? { backgroundColor: item.color } : undefined}
            >
              {item.emoji && <span className="day-item-emoji">{item.emoji}</span>}
              <span className="day-item-content">
                <span className="day-item-title">{item.title}</span>
                {item.description && (
                  <span className="day-item-desc">{item.description}</span>
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(i);
              }}
              className="day-item-remove"
              aria-label={`Remove ${item.title}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onAddClick} className="day-add-btn">
        + Add item
      </button>
    </section>
  );
}

export default App;
