import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Flame, Droplets, Wind, Home } from "lucide-react"
import Navigation from "@/components/navigation"

const disasterTips = [
  {
    id: "earthquake",
    title: "地震対策",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    tips: [
      {
        title: "地震発生時の行動",
        content:
          "まず身の安全を確保し、机の下に隠れるか頭を保護してください。揺れが収まったら火の始末をし、避難経路を確保しましょう。",
      },
      {
        title: "家具の固定",
        content:
          "タンスや本棚などの大型家具は壁に固定し、食器棚にはストッパーを付けましょう。寝室には倒れやすい家具を置かないことが重要です。",
      },
      {
        title: "避難経路の確認",
        content:
          "普段から家族で避難経路を確認し、複数のルートを把握しておきましょう。夜間でも安全に避難できるよう、懐中電灯を各部屋に配置します。",
      },
    ],
  },
  {
    id: "fire",
    title: "火災対策",
    icon: Flame,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    tips: [
      {
        title: "初期消火",
        content:
          "火災を発見したら大声で周囲に知らせ、119番通報をしてから初期消火を行います。天井に火が回ったら避難を優先してください。",
      },
      {
        title: "煙からの避難",
        content:
          "煙は上に上がるため、姿勢を低くして避難します。濡れたタオルで口と鼻を覆い、煙を吸わないよう注意しましょう。",
      },
      {
        title: "消火器の使い方",
        content:
          "ピンを抜き、ホースを火元に向け、レバーを強く握って消火剤を放射します。風上から火の根元を狙って消火してください。",
      },
    ],
  },
  {
    id: "flood",
    title: "水害対策",
    icon: Droplets,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    tips: [
      {
        title: "浸水時の避難",
        content: "水深が膝上まで来たら避難は危険です。無理に避難せず、建物の2階以上に垂直避難しましょう。",
      },
      {
        title: "情報収集",
        content:
          "気象情報や避難情報を常にチェックし、早めの避難を心がけましょう。ラジオやスマートフォンで最新情報を入手します。",
      },
      {
        title: "浸水対策",
        content: "土のうや水のうで浸水を防ぎます。電気製品は高い場所に移動し、ブレーカーを切って感電を防止しましょう。",
      },
    ],
  },
  {
    id: "typhoon",
    title: "台風対策",
    icon: Wind,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    tips: [
      {
        title: "事前準備",
        content: "窓ガラスに飛散防止フィルムを貼り、雨戸やシャッターを閉めます。ベランダの物は室内に取り込みましょう。",
      },
      {
        title: "停電対策",
        content:
          "懐中電灯、ろうそく、携帯ラジオを準備します。冷凍庫の食品が溶けないよう、保冷剤を多めに用意しておきましょう。",
      },
      {
        title: "外出時の注意",
        content:
          "台風接近時は不要不急の外出を控えます。やむを得ず外出する場合は、飛来物に注意し、頑丈な建物に避難しましょう。",
      },
    ],
  },
]

const preparationItems = [
  {
    category: "食料・水",
    items: [
      "飲料水（1人1日3リットル×3日分）",
      "非常食（缶詰、レトルト食品、乾パンなど）",
      "カセットコンロ・ガスボンベ",
      "紙皿・紙コップ・割り箸",
    ],
  },
  {
    category: "生活用品",
    items: ["懐中電灯・ランタン", "携帯ラジオ", "乾電池", "モバイルバッテリー", "ろうそく・マッチ・ライター"],
  },
  {
    category: "衛生用品",
    items: ["救急用品（絆創膏、消毒液など）", "常備薬", "マスク", "ウェットティッシュ", "トイレットペーパー"],
  },
  {
    category: "その他",
    items: ["現金（小銭も含む）", "身分証明書のコピー", "保険証のコピー", "軍手・作業用手袋", "ビニール袋・ゴミ袋"],
  },
]

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">防災知識</h1>
          <p className="text-gray-600">災害に備えて知っておきたい知識と準備</p>
        </div>

        <div className="space-y-8">
          {/* 災害別対策 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">災害別対策</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {disasterTips.map((disaster) => (
                <Card key={disaster.id} className={disaster.bgColor}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <disaster.icon className={`h-6 w-6 ${disaster.color}`} />
                      {disaster.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {disaster.tips.map((tip, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">{tip.title}</h4>
                        <p className="text-sm text-gray-700">{tip.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 備蓄品チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">備蓄品チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {preparationItems.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-600" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 重要な連絡先 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">重要な連絡先</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <h3 className="font-bold text-red-700 text-lg mb-2">警察</h3>
                    <p className="text-3xl font-bold text-red-600">110</p>
                    <p className="text-sm text-red-600 mt-1">事件・事故・盗難</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-bold text-orange-700 text-lg mb-2">消防・救急</h3>
                    <p className="text-3xl font-bold text-orange-600">119</p>
                    <p className="text-sm text-orange-600 mt-1">火災・救急・救助</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-blue-700 text-lg mb-2">災害用伝言ダイヤル</h3>
                    <p className="text-3xl font-bold text-blue-600">171</p>
                    <p className="text-sm text-blue-600 mt-1">安否確認・伝言</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
