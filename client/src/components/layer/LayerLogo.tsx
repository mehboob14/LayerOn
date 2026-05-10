interface LayerLogoProps {
  variant?: "ink" | "bone";
  className?: string;
}

export function LayerLogo({ variant = "ink", className = "" }: LayerLogoProps) {
  const top = variant === "ink" ? "#0E1628" : "#F4F1EA";
  return (
    <span className={`layer-logo ${className}`}>
      <svg className="layer-logo-mark" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="4" width="20" height="3.6" rx="0.5" fill={top} />
        <rect x="2" y="10" width="20" height="3.6" rx="0.5" fill="#FF7A5C" />
        <rect x="2" y="16" width="20" height="3.6" rx="0.5" fill="#D4FF3A" />
      </svg>
      <span className="layer-wordmark">LayerOn</span>
    </span>
  );
}
