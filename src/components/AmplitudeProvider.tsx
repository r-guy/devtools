"use client"

import { useEffect } from "react"
import * as amplitude from "@amplitude/unified"

export default function AmplitudeProvider() {
  useEffect(() => {
    amplitude.initAll(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
      analytics: {
        autocapture: {
          attribution: {
            trackingMethod: ["userProperty", "eventProperty"],
          },
          fileDownloads: true,
          formInteractions: true,
          pageViews: true,
          sessions: true,
          elementInteractions: true,
          networkTracking: true,
          webVitals: true,
          frustrationInteractions: {
            thrashedCursor: true,
            errorClicks: true,
            deadClicks: true,
            rageClicks: true,
          },
        },
      },
      sessionReplay: {
        sampleRate: 1,
      },
    })
  }, [])

  return null
}
