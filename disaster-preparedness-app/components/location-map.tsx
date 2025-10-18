"use client"

import { useEffect, useRef } from "react"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
  status: "safe" | "need_help" | "evacuating" | "unknown"
  message?: string
}

interface FamilyMember {
  id: string
  name: string
  location?: LocationData
  lastUpdated?: number
}

interface LocationMapProps {
  location: LocationData | null
  familyMembers: FamilyMember[]
}

export default function LocationMap({ location, familyMembers }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!location || !mapRef.current) return

    // OpenStreetMapを使用した簡単な地図表示
    const mapHtml = `
      <div style="width: 100%; height: 300px; background: #f0f0f0; border-radius: 8px; position: relative; overflow: hidden;">
        <iframe
          width="100%"
          height="100%"
          frameborder="0"
          scrolling="no"
          marginheight="0"
          marginwidth="0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}"
          style="border: 0; border-radius: 8px;"
        ></iframe>
        <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 12px;">
          📍 現在位置<br/>
          精度: ±${Math.round(location.accuracy)}m
        </div>
      </div>
    `

    mapRef.current.innerHTML = mapHtml
  }, [location])

  if (!location) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">位置情報を取得してください</p>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full" />
}
