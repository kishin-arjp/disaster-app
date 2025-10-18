"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, AlertTriangle, Settings } from "lucide-react"
import Navigation from "@/components/navigation"
import LocationMap from "@/components/location-map"
import RealtimeLocationTracker from "@/components/realtime-location-tracker"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
  status: "safe" | "need_help" | "evacuating" | "unknown"
  message?: string
}

export default function LocationPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string>("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [userStatus, setUserStatus] = useState<LocationData["status"]>("unknown")
  const [statusMessage, setStatusMessage] = useState("")
  const [familyCode, setFamilyCode] = useState("")
  const [memberName, setMemberName] = useState("")
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false)

  useEffect(() => {
    // 保存された設定を読み込み
    const savedLocation = localStorage.getItem("currentLocation")
    if (savedLocation) {
      setCurrentLocation(JSON.parse(savedLocation))
    }

    const savedStatus = localStorage.getItem("userStatus")
    if (savedStatus) {
      setUserStatus(savedStatus as LocationData["status"])
    }

    const savedMessage = localStorage.getItem("statusMessage")
    if (savedMessage) {
      setStatusMessage(savedMessage)
    }

    const savedFamilyCode = localStorage.getItem("familyCode")
    if (savedFamilyCode) {
      setFamilyCode(savedFamilyCode)
    }

    const savedMemberName = localStorage.getItem("memberName")
    if (savedMemberName) {
      setMemberName(savedMemberName)
    }

    const savedRealtimeEnabled = localStorage.getItem("realtimeEnabled")
    if (savedRealtimeEnabled === "true") {
      setIsRealtimeEnabled(true)
    }
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("お使いのブラウザは位置情報をサポートしていません")
      return
    }

    setIsGettingLocation(true)
    setLocationError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          status: userStatus,
          message: statusMessage,
        }

        // 住所を取得（逆ジオコーディング）
        try {
          const address = await reverseGeocode(locationData.latitude, locationData.longitude)
          locationData.address = address
        } catch (error) {
          console.error("住所取得エラー:", error)
        }

        setCurrentLocation(locationData)
        localStorage.setItem("currentLocation", JSON.stringify(locationData))
        setIsGettingLocation(false)
      },
      (error) => {
        let errorMessage = "位置情報の取得に失敗しました"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "位置情報の使用が拒否されました。ブラウザの設定を確認してください。"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "位置情報が利用できません"
            break
          case error.TIMEOUT:
            errorMessage = "位置情報の取得がタイムアウトしました"
            break
        }
        setLocationError(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      },
    )
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja`,
    )
    const data = await response.json()
    return data.display_name || "住所不明"
  }

  const updateStatus = (status: LocationData["status"], message: string) => {
    setUserStatus(status)
    setStatusMessage(message)
    localStorage.setItem("userStatus", status)
    localStorage.setItem("statusMessage", message)

    if (currentLocation) {
      const updatedLocation = {
        ...currentLocation,
        status,
        message,
        timestamp: Date.now(),
      }
      setCurrentLocation(updatedLocation)
      localStorage.setItem("currentLocation", JSON.stringify(updatedLocation))
    }
  }

  const enableRealtimeSync = () => {
    if (!familyCode || !memberName) {
      alert("家族コードとメンバー名を入力してください")
      return
    }

    localStorage.setItem("familyCode", familyCode)
    localStorage.setItem("memberName", memberName)
    localStorage.setItem("realtimeEnabled", "true")
    setIsRealtimeEnabled(true)
  }

  const disableRealtimeSync = () => {
    localStorage.setItem("realtimeEnabled", "false")
    setIsRealtimeEnabled(false)
  }

  const getStatusColor = (status: LocationData["status"]) => {
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

  const getStatusText = (status: LocationData["status"]) => {
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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ja-JP")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">位置情報・安否確認</h1>
          <p className="text-gray-600">家族と位置情報をリアルタイムで共有し、お互いの安全を確認しましょう</p>
        </div>

        {locationError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{locationError}</AlertDescription>
          </Alert>
        )}

        {/* リアルタイム同期設定 */}
        {!isRealtimeEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                リアルタイム同期設定
              </CardTitle>
              <CardDescription>家族との位置情報リアルタイム共有を開始するための設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="familyCode">家族コード</Label>
                  <Input
                    id="familyCode"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                    placeholder="例: FAMILY123"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="memberName">あなたの名前</Label>
                  <Input
                    id="memberName"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="例: 田中太郎"
                  />
                </div>
              </div>
              <Button onClick={enableRealtimeSync} className="w-full">
                リアルタイム同期を開始
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 現在位置情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                現在位置
              </CardTitle>
              <CardDescription>あなたの現在位置と状況</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {isGettingLocation ? "位置情報取得中..." : "現在位置を取得"}
              </Button>

              {currentLocation && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">位置情報</span>
                      <Badge className={getStatusColor(currentLocation.status)}>
                        {getStatusText(currentLocation.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      緯度: {currentLocation.latitude.toFixed(6)}, 経度: {currentLocation.longitude.toFixed(6)}
                    </p>
                    {currentLocation.address && (
                      <p className="text-sm text-gray-600 mb-1">住所: {currentLocation.address}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      精度: ±{Math.round(currentLocation.accuracy)}m | 更新:{" "}
                      {formatTimestamp(currentLocation.timestamp)}
                    </p>
                    {currentLocation.message && (
                      <p className="text-sm text-blue-700 mt-2 font-medium">{currentLocation.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 状況更新 */}
              <div className="space-y-3">
                <h4 className="font-medium">現在の状況</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={userStatus === "safe" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus("safe", "安全な場所にいます")}
                    className="text-xs"
                  >
                    ✅ 安全
                  </Button>
                  <Button
                    variant={userStatus === "evacuating" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus("evacuating", "避難場所に向かっています")}
                    className="text-xs"
                  >
                    🏃 避難中
                  </Button>
                  <Button
                    variant={userStatus === "need_help" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateStatus("need_help", "助けが必要です")}
                    className="text-xs"
                  >
                    🆘 助けが必要
                  </Button>
                  <Button
                    variant={userStatus === "unknown" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus("unknown", "")}
                    className="text-xs"
                  >
                    ❓ 不明
                  </Button>
                </div>
              </div>

              {isRealtimeEnabled && (
                <Button
                  variant="outline"
                  onClick={disableRealtimeSync}
                  className="w-full text-red-600 hover:text-red-700 bg-transparent"
                >
                  リアルタイム同期を停止
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 地図表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                地図
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocationMap location={currentLocation} familyMembers={[]} />
            </CardContent>
          </Card>
        </div>

        {/* リアルタイム位置情報トラッカー */}
        {isRealtimeEnabled && familyCode && memberName && (
          <RealtimeLocationTracker familyCode={familyCode} memberName={memberName} currentLocation={currentLocation} />
        )}
      </main>
    </div>
  )
}
