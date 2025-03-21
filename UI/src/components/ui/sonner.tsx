import { useTheme } from "@/components/ui/ThemeProvider";
import { Toaster as Sonner } from "sonner"
import { cn } from "@/lib/utils" // Utility to merge classNames (optional)

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useTheme().theme

  return (
    <Sonner
      duration={4500}
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      toastOptions={{
        classNames: {
          toast: cn(
            "text-start shadow-lg border p-4 rounded-lg",
            theme == "dark"
              ? "bg-neutral-900 text-white border-neutral-800" // Dark theme
              : "bg-neutral-100 text-black border-neutral-300" // Light theme
          ),
          description: "text-muted-foreground text-start",
          actionButton: "bg-primary text-primary-foreground text-start",
          cancelButton: "bg-muted text-muted-foreground text-start",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
