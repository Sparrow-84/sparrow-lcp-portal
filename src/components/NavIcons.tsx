// Line icons for primary nav, replacing platform emoji (which render inconsistently
// across phones/OSes and don't pick up the brand color). currentColor lets each
// nav item's existing text-color class (active/inactive) drive the icon color.
import type { ReactNode } from 'react';

type IconProps = { className?: string };

function base(children: ReactNode, className?: string) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>,
    className,
  );
}

export function GoalsIcon({ className }: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>,
    className,
  );
}

export function MessagesIcon({ className }: IconProps) {
  return base(<path d="M4 5h16v11H8l-4 4V5z" />, className);
}

export function JourneyIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
      <path d="M9 4v14M15 6v14" />
    </>,
    className,
  );
}

export function PerksIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M20 12v9H4v-9" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 7v14" />
      <path d="M12 7c-2-3-6-3-6 0s4 1 6 0z" />
      <path d="M12 7c2-3 6-3 6 0s-4 1-6 0z" />
    </>,
    className,
  );
}

export function AccountIcon({ className }: IconProps) {
  return base(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </>,
    className,
  );
}
