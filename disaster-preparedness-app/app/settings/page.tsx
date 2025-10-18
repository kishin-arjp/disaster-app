"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import DataSharing from "@/components/data-sharing"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Trash2, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const [dataStats, setDataStats] = useState({
    items: 0,
    contacts: 0,
    lastUpdated: null as string | null,
  })

  const updateStats = () => {
    const items = localStorage.getItem("emergencyItems")
    const contacts = localStorage.getItem("emergencyContacts")

    setDataStats({
      items: items ? JSON.parse(items).length : 0,
      contacts: contacts ? JSON.parse(contacts).length : 0,
      lastUpdated: new Date().toLocaleString("ja-JP"),
    })
  }

  const clearAllData = () => {
    if (confirm("すべてのデータを削除しますか？この操作は取り消せません。")) {
      localStorage.removeItem("emergencyItems")
      localStorage.removeItem("emergencyContacts")
      alert("すべてのデータを削除しました。")
      updateStats()
    }
  }

  const handleDataImport = (data: any) => {
    updateStats()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">設定</h1>
          <p className="text-gray-600">アプリの設定とデータ管理</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                データ統計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{dataStats.items}</p>
                  <p className="text-sm text-blue-600">防災用品</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dataStats.contacts}</p>
                  <p className="text-sm text-green-600">緊急連絡先</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Button
                    onClick={updateStats}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <RefreshCw className="h-4 w-4" />
                    更新
                  </Button>
                  {dataStats.lastUpdated && (
                    <p className="text-xs text-gray-500 mt-2">最終更新: {dataStats.lastUpdated}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <DataSharing onDataImport={handleDataImport} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                危険な操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">すべてのデータを削除</h4>
                  <p className="text-sm text-red-700 mb-3">
                    防災用品、緊急連絡先などのすべてのデータが削除されます。この操作は取り消せません。
                  </p>
                  <Button onClick={clearAllData} variant="destructive" size="sm">
                    すべてのデータを削除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
