"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Trash2, Plus, Users } from "lucide-react"
import Navigation from "@/components/navigation"

interface Contact {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  address: string
}

const defaultContacts: Contact[] = [
  {
    id: "1",
    name: "警察",
    relationship: "緊急通報",
    phone: "110",
    email: "",
    address: "",
  },
  {
    id: "2",
    name: "消防・救急",
    relationship: "緊急通報",
    phone: "119",
    email: "",
    address: "",
  },
  {
    id: "3",
    name: "災害用伝言ダイヤル",
    relationship: "安否確認",
    phone: "171",
    email: "",
    address: "",
  },
]

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(defaultContacts)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    const savedContacts = localStorage.getItem("emergencyContacts")
    if (savedContacts) {
      const parsed = JSON.parse(savedContacts)
      setContacts([...defaultContacts, ...parsed])
    }
  }, [])

  const saveContacts = (updatedContacts: Contact[]) => {
    const customContacts = updatedContacts.filter(
      (contact) => !defaultContacts.some((defaultContact) => defaultContact.id === contact.id),
    )
    localStorage.setItem("emergencyContacts", JSON.stringify(customContacts))
    setContacts(updatedContacts)
  }

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: Contact = {
        id: Date.now().toString(),
        ...newContact,
      }
      const updatedContacts = [...contacts, contact]
      saveContacts(updatedContacts)
      setNewContact({
        name: "",
        relationship: "",
        phone: "",
        email: "",
        address: "",
      })
      setIsAddingContact(false)
    }
  }

  const removeContact = (id: string) => {
    // デフォルトの連絡先は削除できない
    if (defaultContacts.some((contact) => contact.id === id)) return

    const updatedContacts = contacts.filter((contact) => contact.id !== id)
    saveContacts(updatedContacts)
  }

  const isDefaultContact = (id: string) => {
    return defaultContacts.some((contact) => contact.id === id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">緊急連絡先</h1>
            <p className="text-gray-600">災害時の重要な連絡先を管理しましょう</p>
          </div>
          <Button onClick={() => setIsAddingContact(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            連絡先追加
          </Button>
        </div>

        {isAddingContact && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>新しい連絡先を追加</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">名前</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="例: 田中太郎"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">続柄・関係</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    placeholder="例: 家族、友人、職場"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="例: 090-1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="例: example@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  placeholder="例: 東京都渋谷区..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addContact}>追加</Button>
                <Button variant="outline" onClick={() => setIsAddingContact(false)}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  連絡先が登録されていません。
                  <br />
                  「連絡先追加」ボタンから緊急連絡先を登録しましょう。
                </p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {contact.relationship}
                        {isDefaultContact(contact.id) && (
                          <Badge variant="secondary" className="text-xs">
                            システム
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {!isDefaultContact(contact.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContact(contact.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline font-medium">
                        {contact.phone}
                      </a>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.address && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">{contact.address}</p>
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
