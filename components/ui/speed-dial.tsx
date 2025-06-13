"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// SpeedDial Container
interface SpeedDialProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center"
  children: React.ReactNode
}

export function SpeedDial({
  position = "bottom-right",
  className,
  children,
  ...props
}: SpeedDialProps) {
  const positionClasses = {
    "bottom-right": "fixed bottom-4 right-4",
    "bottom-left": "fixed bottom-4 left-4",
    "bottom-center": "fixed bottom-4 left-1/2 -translate-x-1/2",
    "top-right": "fixed top-4 right-4",
    "top-left": "fixed top-4 left-4",
    "top-center": "fixed top-4 left-1/2 -translate-x-1/2",
  }

  return (
    <div
      className={cn(
        "z-50",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// SpeedDial Trigger Button
const speedDialTriggerVariants = cva(
  "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        info: "bg-indigo-600 text-white hover:bg-indigo-700",
        success: "bg-emerald-600 text-white hover:bg-emerald-700",
        warning: "bg-amber-600 text-white hover:bg-amber-700",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SpeedDialTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof speedDialTriggerVariants> {
  icon: React.ReactNode
}

const SpeedDialContext = React.createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  isOpen: false,
  setIsOpen: () => undefined,
})

export function SpeedDialTrigger({
  className,
  variant,
  icon,
  ...props
}: SpeedDialTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <SpeedDialContext.Provider value={{ isOpen, setIsOpen }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(speedDialTriggerVariants({ variant }), className)}
        {...props}
      >
        {icon}
      </button>
      <SpeedDialListWrapper />
    </SpeedDialContext.Provider>
  )
}

// SpeedDial List Wrapper with Animation
function SpeedDialListWrapper() {
  const { isOpen } = React.useContext(SpeedDialContext)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute bottom-16 right-0 left-0 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="flex flex-col items-center gap-2"
            onClick={() => document.body.click()}
          >
            <SpeedDialChildrenRenderer />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// SpeedDial List Container
interface SpeedDialListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SpeedDialList({ className, children, ...props }: SpeedDialListProps) {
  // Convert children to array for the context
  const childrenArray = React.Children.toArray(children);
  
  return (
    <SpeedDialChildrenContext.Provider value={childrenArray}>
      {/* The actual rendering is handled by SpeedDialListWrapper */}
    </SpeedDialChildrenContext.Provider>
  )
}

function SpeedDialChildrenRenderer() {
  const { setIsOpen } = React.useContext(SpeedDialContext)
  const childrenArray = React.useContext(SpeedDialChildrenContext)

  return (
    <>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setIsOpen(false)}
        >
          {child}
        </motion.div>
      ))}
    </>
  )
}

// Context to collect children
const SpeedDialChildrenContext = React.createContext<React.ReactNode[]>([])

// SpeedDial Button
const speedDialButtonVariants = cva(
  "flex items-center gap-2 rounded-full shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        info: "bg-indigo-600 text-white hover:bg-indigo-700",
        success: "bg-emerald-600 text-white hover:bg-emerald-700",
        warning: "bg-amber-600 text-white hover:bg-amber-700",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SpeedDialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof speedDialButtonVariants> {
  icon: React.ReactNode
  label?: string
}

export function SpeedDialButton({
  className,
  variant,
  icon,
  label,
  ...props
}: SpeedDialButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        speedDialButtonVariants({ variant }),
        "h-10 pl-2 pr-3",
        className
      )}
      {...props}
    >
      <span className="flex h-6 w-6 items-center justify-center">
        {icon}
      </span>
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  )
}
