"use client"

import { useCallback, useEffect, useState } from "react"
import type { Container, Engine } from "tsparticles-engine"
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim"
import { useTheme } from "next-themes"

export default function ParticlesBackground() {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Wait for mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine)
    }, [])

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        // await console.log(container)
    }, [])

    if (!mounted) return null

    const currentTheme = theme === "system" ? systemTheme : theme
    const isDark = currentTheme === "dark"

    // Configuration for Dark Mode (Glowing Fireflies) vs Light Mode (Darker dots)
    const particleColor = isDark ? ["#16a34a", "#eab308"] : ["#16a34a", "#15803d"]
    const bgColor = "transparent"

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
                background: {
                    color: {
                        value: bgColor,
                    },
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "repulse",
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: particleColor,
                    },
                    links: {
                        enable: false,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: true,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 80,
                    },
                    opacity: {
                        // Higher opacity in light mode to be visible
                        value: isDark ? { min: 0.1, max: 0.6 } : { min: 0.3, max: 0.8 },
                        animation: {
                            enable: true,
                            speed: 1,
                            sync: false,
                        },
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            }}
            className="fixed inset-0 -z-10"
        />
    )
}
