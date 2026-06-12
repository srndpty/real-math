import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// モーダル的に表示されるパネル内に Tab フォーカスを閉じ込める。
// デスクトップのサイドパネルは非モーダルなので active=false で無効化すること。
export const useFocusTrap = (
  ref: RefObject<HTMLElement | null>,
  active: boolean
): void => {
  useEffect(() => {
    if (!active) {
      return;
    }
    const container = ref.current;
    if (!container) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || !container.contains(current)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (current === last || !container.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [ref, active]);
};
