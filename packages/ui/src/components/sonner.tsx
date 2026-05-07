"use client"
import "sonner/dist/styles.css"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] group-[.toaster]:rounded-xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground/60 text-[12px] tracking-wide",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-black uppercase tracking-widest text-[10px] h-8 rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-black uppercase tracking-widest text-[10px] h-8 rounded-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
