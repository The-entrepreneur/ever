import React from "react";

interface EverLogoProps {
  className?: string;
  showSubtitle?: boolean;
  height?: number | string;
  lightMode?: boolean;
}

export function EverLogo({ className = "", showSubtitle = true, height = 48, lightMode = false }: EverLogoProps) {
  // Brand colors extracted from image:
  // Navy brand blue: #112347 (or white for lightMode/dark bg)
  // Warm horizon gold: #DF9C36
  const textColor = lightMode ? "#FFFFFF" : "#112347";
  const goldColor = "#DF9C36";

  return (
    <div className={`flex items-center justify-center select-none ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 320 120"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            {`
              .logo-name {
                font-family: -apple-system, BlinkMacSystemFont, "Outfit", "Inter", "Segoe UI", sans-serif;
                font-weight: 700;
              }
              .logo-sub {
                font-family: -apple-system, BlinkMacSystemFont, "Outfit", "Inter", "Segoe UI", sans-serif;
                font-weight: 500;
                letter-spacing: 0.05em;
              }
            `}
          </style>
        </defs>

        {/* Golden horizon arc crossing behind/through the text (precise organic curve) */}
        <path
          d="M 15 72 Q 160 41 305 72 Q 160 45 15 72 Z"
          fill={goldColor}
        />

        {/* Logo Text: "Ever" */}
        <text
          x="160"
          y="72"
          textAnchor="middle"
          fill={textColor}
          fontSize="68"
          className="logo-name"
          letterSpacing="-0.03em"
        >
          Ever
        </text>

        {/* Subtitle phrase: "the front desk agent" */}
        {showSubtitle && (
          <text
            x="160"
            y="98"
            textAnchor="middle"
            fill={goldColor}
            fontSize="15"
            className="logo-sub"
          >
            the front desk agent
          </text>
        )}
      </svg>
    </div>
  );
}
