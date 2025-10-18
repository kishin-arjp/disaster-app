"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, type FamilyLocation } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
  status: "safe" | "need_help" | "evacuating" | "unknown"
  message?: string
}

export function useRealtimeLocation(familyCode: string, memberName: string) {
  const [familyLocations, setFamilyLocations] = useState<FamilyLocation[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // デバイスIDを生成（ブラウザ固有）
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem("deviceId")
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("deviceId", deviceId)
    }
    return deviceId
  }, [])

  // 初期データ読み込み
  const loadFamilyLocations = useCallback(async () => {
    if (!familyCode) return

    try {
      const { data, error } = await supabase
        .from("family_locations")
        .select("*")
        .eq("family_code", familyCode)
        .order("updated_at", { ascending: false })

      if (error) throw error

      // 各メンバーの最新位置のみを取得
      const latestLocations = data.reduce((acc: FamilyLocation[], location) => {
        const existingIndex = acc.findIndex((l) => l.member_name === location.member_name)
        if (existingIndex === -1) {
          acc.push(location)
        } else if (new Date(location.updated_at) > new Date(acc[existingIndex].updated_at)) {
          acc[existingIndex] = location
        }
        return acc
      }, [])

      setFamilyLocations(latestLocations)
    } catch (error) {
      console.error("位置情報の読み込みエラー:", error)
    }
  }, [familyCode])

  // リアルタイム接続設定
  useEffect(() => {
    if (!familyCode) return

    const channelName = `family_locations:family_code=eq.${familyCode}`
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_locations",
          filter: `family_code=eq.${familyCode}`,
        },
        (payload) => {
          console.log("リアルタイム更新:", payload)

          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newLocation = payload.new as FamilyLocation

            setFamilyLocations((prev) => {
              const filtered = prev.filter((loc) => loc.member_name !== newLocation.member_name)
              return [...filtered, newLocation].sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
              )
            })

            setLastUpdate(new Date())
          }

          if (payload.eventType === "DELETE") {
            const deletedLocation = payload.old as FamilyLocation
            setFamilyLocations((prev) => prev.filter((loc) => loc.id !== deletedLocation.id))
          }
        },
      )
      .subscribe((status) => {
        console.log("リアルタイム接続状態:", status)
        setIsConnected(status === "SUBSCRIBED")
      })

    setChannel(realtimeChannel)
    loadFamilyLocations()

    return () => {
      realtimeChannel.unsubscribe()
    }
  }, [familyCode, loadFamilyLocations])

  // 位置情報を更新
  const updateLocation = useCallback(
    async (locationData: LocationData) => {
      if (!familyCode || !memberName) return

      try {
        const deviceId = getDeviceId()

        // バッテリー情報を取得（対応ブラウザのみ）
        let batteryLevel: number | undefined
        if ("getBattery" in navigator) {
          try {
            const battery = await (navigator as any).getBattery()
            batteryLevel = Math.round(battery.level * 100)
          } catch (e) {
            // バッテリー情報取得失敗は無視
          }
        }

        const locationRecord = {
          family_code: familyCode,
          member_name: memberName,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          address: locationData.address,
          status: locationData.status,
          message: locationData.message,
          battery_level: batteryLevel,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from("family_locations").upsert(locationRecord, {
          onConflict: "family_code,member_name",
        })

        if (error) throw error

        // 家族メンバー情報も更新
        await supabase.from("family_members").upsert(
          {
            family_code: familyCode,
            member_name: memberName,
            device_id: deviceId,
            is_active: true,
            last_seen: new Date().toISOString(),
          },
          {
            onConflict: "device_id",
          },
        )

        console.log("位置情報を更新しました")
      } catch (error) {
        console.error("位置情報更新エラー:", error)
        throw error
      }
    },
    [familyCode, memberName, getDeviceId],
  )

  // 家族グループを作成
  const createFamilyGroup = useCallback(
    async (newFamilyCode: string) => {
      try {
        const { error } = await supabase.from("family_groups").insert({
          family_code: newFamilyCode,
          created_by: getDeviceId(),
        })

        if (error) throw error
        console.log("家族グループを作成しました:", newFamilyCode)
      } catch (error) {
        console.error("家族グループ作成エラー:", error)
        throw error
      }
    },
    [getDeviceId],
  )

  // 緊急アラートを送信
  const sendEmergencyAlert = useCallback(
    async (message: string) => {
      if (!familyCode || !memberName) return

      try {
        await updateLocation({
          latitude: 0, // 実際の位置情報を使用
          longitude: 0,
          accuracy: 0,
          status: "need_help",
          message: `🆘 緊急: ${message}`,
        })

        // プッシュ通知やSMS送信のロジックをここに追加
        console.log("緊急アラートを送信しました")
      } catch (error) {
        console.error("緊急アラート送信エラー:", error)
      }
    },
    [familyCode, memberName, updateLocation],
  )

  return {
    familyLocations,
    isConnected,
    lastUpdate,
    updateLocation,
    createFamilyGroup,
    sendEmergencyAlert,
    refreshLocations: loadFamilyLocations,
  }
}
