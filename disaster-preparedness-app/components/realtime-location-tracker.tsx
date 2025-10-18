"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Wifi, WifiOff, Clock, Battery, AlertTriangle, Users, RefreshCw } from "lucide-react"
import { useRealtimeLocation } from "@/hooks/use-realtime-location"

interface RealtimeLocationTrackerProps {
  familyCode: string
  memberName: string
  currentLocation: {
    latitude: number
    longitude: number
    accuracy: number
    address?: string
    status: "safe" | "need_help" | "evacuating" | "unknown"
    message?: string
  } | null
}

export default function RealtimeLocationTracker({
  familyCode,
  memberName,
  currentLocation,
}: RealtimeLocationTrackerProps) {
  const { familyLocations, isConnected, lastUpdate, updateLocation, sendEmergencyAlert, refreshLocations } =
    useRealtimeLocation(familyCode, memberName)

  const [isUpdating, setIsUpdating] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(false)

  // 自動位置更新（5分間隔）
  useEffect(() => {
    if (!autoUpdate || !currentLocation) return

    const interval = setInterval(
      async () => {
        if (currentLocation) {
          try {
            await updateLocation(currentLocation)
          } catch (error) {
            console.error("自動更新エラー:", error)
          }
        }
      },
      5 * 60 * 1000,
    ) // 5分間隔

    return () => clearInterval(interval)
  }, [autoUpdate, currentLocation, updateLocation])

  const handleManualUpdate = async () => {
    if (!currentLocation) return

    setIsUpdating(true)
    try {
      await updateLocation(currentLocation)
    } catch (error) {
      console.error("手動更新エラー:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEmergencyAlert = async () => {
    if (confirm("緊急アラートを家族に送信しますか？")) {
      await sendEmergencyAlert("助けが必要です")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-800"
      case "need_help":
        return "bg-red-100 text-red-800"
      case "evacuating":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "safe":
        return "安全"
      case "need_help":
        return "助けが必要"
      case "evacuating":
        return "避難中"
      default:
        return "不明"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return "たった今"
    if (minutes < 60) return `${minutes}分前`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}時間前`
    return date.toLocaleDateString("ja-JP")
  }

  return (
    <div className="space-y-6">
      {/* 接続状態 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
            リアルタイム同期
          </CardTitle>
          <CardDescription>家族との位置情報リアルタイム共有</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "接続中" : "切断"}</Badge>
              {lastUpdate && (
                <span className="text-sm text-gray-500">最終更新: {formatTimestamp(lastUpdate.toISOString())}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLocations}
                className="flex items-center gap-1 bg-transparent"
              >
                <RefreshCw className="h-3 w-3" />
                更新
              </Button>
              <Button onClick={handleManualUpdate} disabled={!currentLocation || isUpdating} size="sm">
                {isUpdating ? "送信中..." : "位置情報送信"}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="rounded"
              />
              自動更新（5分間隔）
            </label>
            <Button variant="destructive" size="sm" onClick={handleEmergencyAlert} className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              緊急アラート
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 家族の位置情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            家族の位置情報
          </CardTitle>
          <CardDescription>リアルタイムで更新される家族の現在位置</CardDescription>
        </CardHeader>
        <CardContent>
          {familyLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>まだ家族の位置情報がありません</p>
              <p className="text-sm">家族に家族コードを共有してください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {familyLocations.map((location) => (
                <div
                  key={location.id}
                  className={`p-4 rounded-lg border-2 ${
                    location.status === "need_help" ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{location.member_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(location.status)}>{getStatusText(location.status)}</Badge>
                        {location.battery_level && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Battery className="h-3 w-3" />
                            {location.battery_level}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(location.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        {location.address ? (
                          <p className="text-sm">{location.address}</p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">精度: ±{location.accuracy}m</p>
                      </div>
                    </div>

                    {location.message && (
                      <Alert className={location.status === "need_help" ? "border-red-200 bg-red-50" : ""}>
                        <AlertDescription className={location.status === "need_help" ? "text-red-700" : ""}>
                          {location.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
