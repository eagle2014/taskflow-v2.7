"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={{
        "--normal-bg": "#292d39",
        "--normal-text": "#ffffff",
        "--normal-border": "#3d4457",
        "--success-bg": "#51cf66",
        "--success-text": "#ffffff",
        "--error-bg": "#ff6b6b",
        "--error-text": "#ffffff",
        "--info-bg": "#0394ff",
        "--info-text": "#ffffff",
      } as React.CSSProperties}
      {...props}
    />
  );
};

export { Toaster };