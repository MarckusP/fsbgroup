export function ScrollHint({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <p className={`type-eyebrow flex items-center gap-3 text-bone/45 ${className}`}>
      {label}
      <span aria-hidden className="relative block h-px w-14 overflow-hidden bg-bone/20">
        <span className="absolute inset-y-0 left-0 w-1/3 bg-electric motion-safe:animate-[hint_2.4s_var(--ease-cinema)_infinite]" />
      </span>
    </p>
  );
}
