"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Users, MapPin, BookOpen, Calendar } from "lucide-react"
import Navigation from "@/components/navigation"
import ExpiryAlert from "@/components/expiry-alert"

export default function HomePage() {
  const [emergencyItems, setEmergencyItems] = useState([])
  const [expiringItems, setExpiringItems] = useState([])

  useEffect(() => {
    // ローカルストレージから防災用品データを読み込み
    const savedItems = localStorage.getItem("emergencyItems")
    if (savedItems) {
      const items = JSON.parse(savedItems)
      setEmergencyItems(items)

      // 期限が近い商品をチェック（30日以内）
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const expiring = items.filter((item) => {
        const expiryDate = new Date(item.expiryDate)
        return expiryDate <= thirtyDaysFromNow && expiryDate >= now
      })

      setExpiringItems(expiring)
    }
  }, [])

  const stats = [
    {
      title: "防災用品",
      value: emergencyItems.length,
      description: "登録済みアイテム",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "期限切れ注意",
      value: expiringItems.length,
      description: "30日以内に期限切れ",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
    {
      title: "緊急連絡先",
      value: 5,
      description: "登録済み連絡先",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "避難場所",
      value: 3,
      description: "近隣の避難場所",
      icon: MapPin,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">防災ダッシュボード</h1>
          <p className="text-gray-600">災害に備えて、日頃の準備を管理しましょう</p>
        </div>

        {expiringItems.length > 0 && <ExpiryAlert items={expiringItems} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                今日のチェック項目
              </CardTitle>
              <CardDescription>定期的に確認すべき防災準備</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>懐中電灯の動作確認</span>
                <Badge variant="outline">週1回</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>ラジオの動作確認</span>
                <Badge variant="outline">週1回</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>非常用水の確認</span>
                <Badge variant="outline">月1回</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>家族との連絡方法確認</span>
                <Badge variant="outline">月1回</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                防災豆知識
              </CardTitle>
              <CardDescription>災害時に役立つ知識</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">地震発生時の行動</h4>
                <p className="text-sm text-blue-800">
                  まず身の安全を確保し、机の下に隠れるか、頭を保護してください。
                  揺れが収まったら火の始末をし、避難経路を確保しましょう。
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">非常用水の目安</h4>
                <p className="text-sm text-green-800">
                  1人1日3リットルが目安です。最低3日分、できれば1週間分を備蓄しましょう。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
