// Route persistence utility for maintaining navigation state across refreshes

const ROUTE_STORAGE_KEY = 'ethraa_last_route';
const MODAL_STATE_KEY = 'ethraa_modal_state';

export interface RouteState {
  path: string;
  search: string;
  modalOpen?: boolean;
  modalType?: string;
  timestamp: number;
}

/**
 * Save current route and modal state to localStorage
 */
export function saveRouteState(path: string, search: string, modalState?: { open: boolean; type?: string }) {
  try {
    const state: RouteState = {
      path,
      search,
      modalOpen: modalState?.open,
      modalType: modalState?.type,
      timestamp: Date.now()
    };
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save route state:', error);
  }
}

/**
 * Restore last route state from localStorage
 * Returns null if expired (>24 hours) or invalid
 */
export function restoreRouteState(): RouteState | null {
  try {
    const stored = localStorage.getItem(ROUTE_STORAGE_KEY);
    if (!stored) return null;

    const state: RouteState = JSON.parse(stored);
    const hoursSinceStorage = (Date.now() - state.timestamp) / (1000 * 60 * 60);
    
    // Expire after 24 hours
    if (hoursSinceStorage > 24) {
      clearRouteState();
      return null;
    }

    return state;
  } catch (error) {
    console.warn('Failed to restore route state:', error);
    return null;
  }
}

/**
 * Clear stored route state
 */
export function clearRouteState() {
  try {
    localStorage.removeItem(ROUTE_STORAGE_KEY);
    localStorage.removeItem(MODAL_STATE_KEY);
  } catch (error) {
    console.warn('Failed to clear route state:', error);
  }
}

/**
 * Check if we should restore route (not on auth pages)
 */
export function shouldRestoreRoute(currentPath: string): boolean {
  const noRestorePaths = ['/auth', '/reset-password', '/install'];
  return !noRestorePaths.some(path => currentPath.startsWith(path));
}
