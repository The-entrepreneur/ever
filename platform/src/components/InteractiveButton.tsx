import React from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "motion/react";

interface InteractiveButtonProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function InteractiveButton({
  children,
  to,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: InteractiveButtonProps) {
  // Magnetic effect coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map motion coordinates to small translations for magnetic feedback
  const translateX = useTransform(x, [-100, 100], [-10, 10]);
  const translateY = useTransform(y, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative position inside the button
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const innerButtonContent = (
    <div className="relative w-full h-full flex items-center justify-center gap-1.5 z-10">
      {children}
    </div>
  );

  const baseClasses = `
    group relative overflow-hidden rounded-full font-semibold transition-all duration-300 select-none
    px-6 py-3 cursor-pointer select-none text-[13px] leading-none inline-flex items-center justify-center shadow-md
    text-white bg-zinc-950 border border-zinc-800/80
    ${className}
  `.trim();

  // Highlight/glow effect that moves with the cursor
  const mouseGlowX = useMotionValue(0);
  const mouseGlowY = useMotionValue(0);

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    mouseGlowX.set(mouseX);
    mouseGlowY.set(mouseY);
  };

  const glowStyle = {
    background: "radial-gradient(110px circle at var(--glow-x, 0px) var(--glow-y, 0px), rgba(234, 102, 57, 0.45) 0%, rgba(124, 58, 237, 0.25) 50%, transparent 100%)",
    "--glow-x": useTransform(mouseGlowX, (v) => `${v}px`),
    "--glow-y": useTransform(mouseGlowY, (v) => `${v}px`),
  } as any;

  if (to) {
    return (
      <motion.div
        style={{ x: translateX, y: translateY }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="inline-block"
      >
        <Link
          to={to}
          className={baseClasses}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleContainerMouseMove(e);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Neon running border glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-full">
            <div className="absolute -inset-[100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#EA6639,#7C3AED,#EA6639)] opacity-30 blur-sm rounded-full" />
          </div>

          {/* Radial spotlight tracking hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
            style={glowStyle}
          />

          {/* Glint effect swipe across button */}
          <span className="absolute block inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

          {/* Text layer with micro scale feedback */}
          <span className="relative z-10 flex items-center justify-center gap-1.5 text-white tracking-tight transform group-hover:scale-[1.01] transition-transform duration-300">
            {children}
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ x: translateX, y: translateY }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="inline-block"
    >
      <button
        type={type}
        disabled={disabled}
        className={baseClasses}
        onClick={onClick}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleContainerMouseMove(e);
        }}
        onMouseLeave={handleMouseLeave}
      >
        {/* Neon running border glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-full">
          <div className="absolute -inset-[100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#EA6639,#7C3AED,#EA6639)] opacity-30 blur-sm rounded-full" />
        </div>

        {/* Radial spotlight tracking hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
          style={glowStyle}
        />

        {/* Glint effect swipe across button */}
        <span className="absolute block inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

        <span className="relative z-10 flex items-center justify-center gap-1.5 text-white tracking-tight transform group-hover:scale-[1.01] transition-transform duration-300">
          {children}
        </span>
      </button>
    </motion.div>
  );
}
