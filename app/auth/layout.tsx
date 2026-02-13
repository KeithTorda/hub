import ParticlesBackground from "@/components/ui/particles-background"
import { ModeToggle } from "@/components/mode-toggle"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <ParticlesBackground />
            <div className="absolute right-4 top-4 z-50">
                <ModeToggle />
            </div>
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    )
}
