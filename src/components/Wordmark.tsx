// Text wordmark stand-in. Drop the real asset (logo-primary-circle-green.png) into
// /public and swap this for an <img> when brand assets are finalized.
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-full bg-sparrow-green text-base text-sparrow-gold"
      >
        🕊️
      </span>
      <span className="font-serif text-lg font-semibold leading-none text-sparrow-green">
        Sparrow
        <span className="ml-1.5 align-middle text-xs font-medium uppercase tracking-wide text-sparrow-gold">
          LifeChange
        </span>
      </span>
    </div>
  );
}
