"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Package } from "lucide-react"
import Navigation from "@/components/navigation"

interface EmergencyItem {
  id: string
  name: string
  category: string
  expiryDate: string
  quantity: number
  notes: string
}

const categories = ["食料品", "飲料水", "医薬品", "衛生用品", "工具・用具", "衣類", "その他"]

export default function EmergencyBagPage() {
  const [items, setItems] = useState<EmergencyItem[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    expiryDate: "",
    quantity: 1,
    notes: "",
  })

  useEffect(() => {
    const savedItems = localStorage.getItem("emergencyItems")
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
  }, [])

  const saveItems = (updatedItems: EmergencyItem[]) => {
    setItems(updatedItems)
    localStorage.setItem("emergencyItems", JSON.stringify(updatedItems))
  }

  const addItem = () => {
    if (newItem.name && newItem.category) {
      const item: EmergencyItem = {
        id: Date.now().toString(),
        ...newItem,
      }
      const updatedItems = [...items, item]
      saveItems(updatedItems)
      setNewItem({
        name: "",
        category: "",
        expiryDate: "",
        quantity: 1,
        notes: "",
      })
      setIsAddingItem(false)
    }
  }

  const removeItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    saveItems(updatedItems)
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryBadge = (expiryDate: string) => {
    const daysLeft = getDaysUntilExpiry(expiryDate)
    if (daysLeft === null) return null

    if (daysLeft < 0) {
      return <Badge variant="destructive">期限切れ</Badge>
    } else if (daysLeft <= 7) {
      return <Badge variant="destructive">あと{daysLeft}日</Badge>
    } else if (daysLeft <= 30) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          あと{daysLeft}日
        </Badge>
      )
    } else {
      return <Badge variant="secondary">あと{daysLeft}日</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">防災バッグ管理</h1>
            <p className="text-gray-600">非常用品の在庫と期限を管理しましょう</p>
          </div>
          <Button onClick={() => setIsAddingItem(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            アイテム追加
          </Button>
        </div>

        {isAddingItem && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>新しいアイテムを追加</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">アイテム名</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="例: 缶詰パン"
                  />
                </div>
                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiryDate">消費期限</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">数量</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">メモ</Label>
                <Input
                  id="notes"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="保管場所や注意事項など"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addItem}>追加</Button>
                <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  まだアイテムが登録されていません。
                  <br />
                  「アイテム追加」ボタンから防災用品を登録しましょう。
                </p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.category}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">数量:</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                    {item.expiryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">期限:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.expiryDate}</span>
                          {getExpiryBadge(item.expiryDate)}
                        </div>
                      </div>
                    )}
                    {item.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
