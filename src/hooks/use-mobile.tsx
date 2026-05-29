import * as React from "react"
import { Capacitor } from "@capacitor/core"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    if (Capacitor.isNativePlatform()) {
      return window.innerWidth < MOBILE_BREAKPOINT || window.innerWidth === 0
    }
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    console.log("[useIsMobile] innerWidth:", window.innerWidth, "isNative:", Capacitor.isNativePlatform());
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
