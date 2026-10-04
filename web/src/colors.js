const PALETTE = [
  '#4f8cff', '#f59e0b', '#10b981', '#ef4444', '#a855f7',
  '#14b8a6', '#ec4899', '#84cc16', '#f97316', '#06b6d4',
];

export const communityColor = (community) => PALETTE[Math.abs(Number(community) || 0) % PALETTE.length];
