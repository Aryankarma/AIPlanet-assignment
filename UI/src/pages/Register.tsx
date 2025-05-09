import { GalleryVerticalEnd } from "lucide-react"
import { RegisterForm } from "@/components/app/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-sidebar-accent">
      <div className="flex w-full max-w-sm flex-col gap-4">
        {/* branding */}
        {/* <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a> */}
        <RegisterForm />
      </div>
    </div>
  )
}
