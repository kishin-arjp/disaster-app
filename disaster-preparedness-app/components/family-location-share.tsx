"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Share2, Users, QrCode, Clock, MapPin, Plus, Trash2 } from "lucide-react"
import QRCode from "qrcode"

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

interface FamilyLocationShareProps {
  currentLocation: LocationData | null
  familyMembers: FamilyMember[]
  onFamilyMembersUpdate: (members: FamilyMember[]) => void
}

export default function FamilyLocationShare({
  currentLocation,
  familyMembers,
  onFamilyMembersUpdate,
}: FamilyLocationShareProps) {
  const [familyCode, setFamilyCode] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const generateFamilyCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFamilyCode(code)
    localStorage.setItem("familyCode", code)
  }

  const generateLocationQR = async () => {
    if (!currentLocation) return

    setIsGeneratingQR(true)
    try {
      const shareData = {
        type: "location_share",
        familyCode: familyCode || "TEMP",
        location: currentLocation,
        memberName: "私", // 実際の実装では設定から取得
        timestamp: Date.now(),
      }

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(shareData), {
        width: 300,
        margin: 2,
      })

      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error("QRコード生成エラー:", error)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const addFamilyMember = () => {
    if (!newMemberName.trim()) return

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
    }

    const updatedMembers = [...familyMembers, newMember]
    onFamilyMembersUpdate(updatedMembers)
    localStorage.setItem("familyMembers", JSON.stringify(updatedMembers))
    setNewMemberName("")
  }

  const removeFamilyMember = (id: string) => {
    const updatedMembers = familyMembers.filter((member) => member.id !== id)
    onFamilyMembersUpdate(updatedMembers)
    localStorage.setItem("familyMembers", JSON.stringify(updatedMembers))
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
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)

    if (minutes < 1) return "たった今"
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    return new Date(timestamp).toLocaleString("ja-JP")
  }

  return (
    <div className="space-y-6">
      {/* 家族グループ管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            家族グループ
          </CardTitle>
          <CardDescription>家族と位置情報を共有するためのグループを管理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="familyCode">家族コード</Label>
              <Input
                id="familyCode"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                placeholder="家族コードを入力"
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateFamilyCode} variant="outline">
                新規作成
              </Button>
            </div>
          </div>

          {familyCode && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                家族コード: <strong className="font-mono">{familyCode}</strong>
                <br />
                このコードを家族に共有してください。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 位置情報共有 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            位置情報共有
          </CardTitle>
          <CardDescription>QRコードで現在位置を家族と共有</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateLocationQR}
            disabled={!currentLocation || isGeneratingQR}
            className="w-full flex items-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            {isGeneratingQR ? "QRコード生成中..." : "位置情報QRコード生成"}
          </Button>

          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">家族にこのQRコードを読み取ってもらってください</p>
              <img src={qrCodeUrl || "/placeholder.svg"} alt="位置情報共有QRコード" className="border rounded" />
              <p className="text-xs text-gray-500 text-center">
                現在位置と安否情報が含まれています
                <br />
                {currentLocation && formatTimestamp(currentLocation.timestamp)}に更新
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 家族メンバー管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            家族メンバー
          </CardTitle>
          <CardDescription>家族メンバーの位置情報と安否状況</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="家族の名前を入力"
            />
            <Button onClick={addFamilyMember} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {familyMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">まだ家族メンバーが登録されていません</p>
            ) : (
              familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{member.name}</span>
                      {member.location && (
                        <Badge className={getStatusColor(member.location.status)}>
                          {getStatusText(member.location.status)}
                        </Badge>
                      )}
                    </div>
                    {member.location ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {member.location.address ||
                              `${member.location.latitude.toFixed(4)}, ${member.location.longitude.toFixed(4)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(member.location.timestamp)}</span>
                        </div>
                        {member.location.message && (
                          <p className="text-blue-600 text-xs mt-1">{member.location.message}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">位置情報なし</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFamilyMember(member.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
