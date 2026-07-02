export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo-primary-circle-green.png"
        alt="Sparrow"
        className="h-9 w-9 shrink-0"
      />
      <span className="font-serif text-lg font-semibold leading-none text-sparrow-green">
        Sparrow
        <span className="ml-1.5 align-middle text-xs font-medium uppercase tracking-wide text-sparrow-gold">
          LifeChange
        </span>
      </span>
    </div>
  );
}
