import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Phone } from "lucide-react"
import Navigation from "@/components/navigation"

const evacuationSites = [
  {
    id: "1",
    name: "中央小学校",
    type: "指定避難所",
    address: "東京都渋谷区中央1-2-3",
    capacity: "500人",
    distance: "徒歩5分",
    facilities: ["体育館", "校庭", "給水設備", "非常用電源"],
    phone: "03-1234-5678",
    notes: "ペット同伴可能",
  },
  {
    id: "2",
    name: "区民センター",
    type: "福祉避難所",
    address: "東京都渋谷区中央2-3-4",
    capacity: "200人",
    distance: "徒歩8分",
    facilities: ["多目的ホール", "和室", "バリアフリー", "医務室"],
    phone: "03-2345-6789",
    notes: "高齢者・障害者優先",
  },
  {
    id: "3",
    name: "中央公園",
    type: "一時避難場所",
    address: "東京都渋谷区中央3-4-5",
    capacity: "1000人",
    distance: "徒歩3分",
    facilities: ["広場", "防災倉庫", "かまどベンチ"],
    phone: "",
    notes: "火災時の一時避難に使用",
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case "指定避難所":
      return "bg-blue-100 text-blue-800"
    case "福祉避難所":
      return "bg-green-100 text-green-800"
    case "一時避難場所":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function EvacuationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">避難場所情報</h1>
          <p className="text-gray-600">お近くの避難場所を確認しておきましょう</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>避難場所の種類</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800">指定避難所</Badge>
                <div>
                  <p className="font-medium">長期滞在可能な施設</p>
                  <p className="text-sm text-gray-600">学校の体育館や公民館など、数日間滞在できる施設</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-green-100 text-green-800">福祉避難所</Badge>
                <div>
                  <p className="font-medium">要配慮者向け施設</p>
                  <p className="text-sm text-gray-600">高齢者や障害者など、特別な配慮が必要な方向けの施設</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-orange-100 text-orange-800">一時避難場所</Badge>
                <div>
                  <p className="font-medium">緊急時の一時避難</p>
                  <p className="text-sm text-gray-600">火災や地震発生時に一時的に避難する場所</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>避難時の注意点</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <p className="text-sm">避難する前に火の始末と電気のブレーカーを切る</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <p className="text-sm">動きやすい服装で、荷物は最小限に</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <p className="text-sm">近所の人と声をかけ合って避難する</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <p className="text-sm">車での避難は控え、徒歩で避難する</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">5.</span>
                <p className="text-sm">避難場所では係員の指示に従う</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {evacuationSites.map((site) => (
            <Card key={site.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{site.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {site.address}
                    </CardDescription>
                  </div>
                  <Badge className={getTypeColor(site.type)}>{site.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">収容人数: {site.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">距離: {site.distance}</span>
                  </div>
                  {site.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${site.phone}`} className="text-sm text-blue-600 hover:underline">
                        {site.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">設備・施設</h4>
                  <div className="flex flex-wrap gap-2">
                    {site.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>

                {site.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>備考:</strong> {site.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
