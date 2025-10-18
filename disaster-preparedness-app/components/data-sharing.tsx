"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Download, Upload, Share2 } from "lucide-react"
import QRCode from "qrcode"

interface DataSharingProps {
  onDataImport: (data: any) => void
}

export default function DataSharing({ onDataImport }: DataSharingProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const getAllData = () => {
    const emergencyItems = localStorage.getItem("emergencyItems")
    const emergencyContacts = localStorage.getItem("emergencyContacts")

    return {
      emergencyItems: emergencyItems ? JSON.parse(emergencyItems) : [],
      emergencyContacts: emergencyContacts ? JSON.parse(emergencyContacts) : [],
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0",
    }
  }

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      const data = getAllData()
      const dataString = JSON.stringify(data)

      // QRコード生成
      const qrCodeDataUrl = await QRCode.toDataURL(dataString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error("QRコード生成エラー:", error)
      alert("QRコードの生成に失敗しました")
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToFile = () => {
    const data = getAllData()
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `そなログデータ_${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.emergencyItems) {
          localStorage.setItem("emergencyItems", JSON.stringify(data.emergencyItems))
        }

        if (data.emergencyContacts) {
          localStorage.setItem("emergencyContacts", JSON.stringify(data.emergencyContacts))
        }

        onDataImport(data)
        alert("データのインポートが完了しました！")

        // ページをリロードして最新データを反映
        window.location.reload()
      } catch (error) {
        console.error("インポートエラー:", error)
        alert("データの読み込みに失敗しました。ファイル形式を確認してください。")
      }
    }

    reader.readAsText(file)
  }

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        const data = getAllData()
        const dataStr = JSON.stringify(data, null, 2)
        const blob = new Blob([dataStr], { type: "application/json" })
        const file = new File([blob], `そなログデータ_${new Date().toISOString().split("T")[0]}.json`, {
          type: "application/json",
        })

        await navigator.share({
          title: "そなログ - 防災データ",
          text: "家族の防災データを共有します",
          files: [file],
        })
      } catch (error) {
        console.error("共有エラー:", error)
        // フォールバック: ファイルダウンロード
        exportToFile()
      }
    } else {
      // Web Share API非対応の場合はファイルダウンロード
      exportToFile()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            データ共有
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={generateQRCode} disabled={isGenerating} className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              {isGenerating ? "生成中..." : "QRコード生成"}
            </Button>

            <Button onClick={shareViaWebShare} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Share2 className="h-4 w-4" />
              データ共有
            </Button>

            <Button onClick={exportToFile} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              ファイル出力
            </Button>
          </div>

          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">家族にこのQRコードを読み取ってもらってください</p>
              <img src={qrCodeUrl || "/placeholder.svg"} alt="データ共有用QRコード" className="border rounded" />
              <p className="text-xs text-gray-500">QRコードには防災データが含まれています</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            データ取り込み
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-import">ファイルから取り込み</Label>
              <Input id="file-import" type="file" accept=".json" onChange={importFromFile} className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">そなログから出力されたJSONファイルを選択してください</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
