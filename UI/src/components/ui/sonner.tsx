import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      duration={5000}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group text-start  toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground text-start",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-start",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-start",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
