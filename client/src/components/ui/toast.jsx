import React from "react"
import { cn } from "../../lib/utils"

const Toast = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-50 min-w-[200px] rounded-md bg-white p-4 shadow-lg",
      className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

const useToast = () => {
  const [toasts, setToasts] = React.useState([])

  const toast = ({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return { toast, toasts }
}

const Toaster = () => {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          className={cn(
            toast.variant === "destructive" && "bg-red-100 text-red-900"
          )}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </Toast>
      ))}
    </>
  )
}

export { useToast, Toaster } 