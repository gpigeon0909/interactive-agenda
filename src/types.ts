export type AgendaItem = {
  id: string;
  title: string;
  description?: string;
  color?: string;
  emoji?: string;
};

export type WeekItems = Record<string, AgendaItem[]>;

const PRESET_COLORS = [
  '#fef3c7', '#d1fae5', '#dbeafe', '#e9d5ff', '#fce7f3',
  '#fed7aa', '#e0e7ff', '#ccfbf1', '#fef9c3', '#fecaca',
];

export const ITEM_PRESET_COLORS = PRESET_COLORS;

export const QUICK_EMOJIS = ['📌', '🎯', '💼', '🏠', '💪', '📅', '✅', '🔥', '⭐', '📝', '☕', '🎮'];
