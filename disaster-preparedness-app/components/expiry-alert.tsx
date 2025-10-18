import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface ExpiryAlertProps {
  items: Array<{
    id: string
    name: string
    expiryDate: string
    category: string
  }>
}

export default function ExpiryAlert({ items }: ExpiryAlertProps) {
  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">期限切れ注意！</AlertTitle>
      <AlertDescription className="text-orange-700">
        以下のアイテムの期限が近づいています：
        <div className="mt-2 space-y-2">
          {items.map((item) => {
            const daysLeft = getDaysUntilExpiry(item.expiryDate)
            return (
              <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded">
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.category}</Badge>
                  <Badge variant={daysLeft <= 7 ? "destructive" : "outline"}>あと{daysLeft}日</Badge>
                </div>
              </div>
            )
          })}
        </div>
      </AlertDescription>
    </Alert>
  )
}
