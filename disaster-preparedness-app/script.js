// ローカルストレージ管理
function getEmergencyItems() {
  const items = localStorage.getItem("emergencyItems")
  return items ? JSON.parse(items) : []
}

function saveEmergencyItems(items) {
  localStorage.setItem("emergencyItems", JSON.stringify(items))
}

function getEmergencyContacts() {
  const contacts = localStorage.getItem("emergencyContacts")
  return contacts ? JSON.parse(contacts) : []
}

function saveEmergencyContacts(contacts) {
  localStorage.setItem("emergencyContacts", JSON.stringify(contacts))
}

// ナビゲーション
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })

    // メニュー項目クリック時にメニューを閉じる
    const navLinks = document.querySelectorAll(".nav-link")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active")
      })
    })

    // 画面外クリック時にメニューを閉じる
    document.addEventListener("click", (event) => {
      if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
        navMenu.classList.remove("active")
      }
    })
  }
})

// 日付フォーマット関数
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("ja-JP")
}

// 期限までの日数計算
function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 通知機能（ブラウザ通知）
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

function showNotification(title, message) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "/favicon.ico",
    })
  }
}

// 期限切れチェック（定期実行）
function checkExpiryNotifications() {
  const items = getEmergencyItems()
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  items.forEach((item) => {
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate)
      const daysLeft = getDaysUntilExpiry(item.expiryDate)

      // 7日以内に期限切れの場合は通知
      if (daysLeft <= 7 && daysLeft > 0) {
        showNotification("そなログ - 期限切れ注意", `${item.name}があと${daysLeft}日で期限切れです。`)
      }
    }
  })
}

// アプリ初期化
document.addEventListener("DOMContentLoaded", () => {
  // 通知許可をリクエスト
  requestNotificationPermission()

  // 定期的に期限をチェック（1時間ごと）
  setInterval(checkExpiryNotifications, 60 * 60 * 1000)

  // ページ読み込み時にもチェック
  setTimeout(checkExpiryNotifications, 5000)
})

// エラーハンドリング
window.addEventListener("error", (event) => {
  console.error("そなログ アプリケーションエラー:", event.error)
})

// オフライン対応
window.addEventListener("online", () => {
  console.log("オンラインに復帰しました")
})

window.addEventListener("offline", () => {
  console.log("オフラインになりました")
})

// データエクスポート機能
function exportData() {
  const data = {
    emergencyItems: getEmergencyItems(),
    emergencyContacts: getEmergencyContacts(),
    exportDate: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })

  const link = document.createElement("a")
  link.href = URL.createObjectURL(dataBlob)
  link.download = `そなログデータ_${new Date().toISOString().split("T")[0]}.json`
  link.click()
}

// データインポート機能
function importData(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      if (data.emergencyItems) {
        saveEmergencyItems(data.emergencyItems)
      }

      if (data.emergencyContacts) {
        saveEmergencyContacts(data.emergencyContacts)
      }

      alert("データのインポートが完了しました。")
      location.reload()
    } catch (error) {
      alert("データの読み込みに失敗しました。")
      console.error("Import error:", error)
    }
  }

  reader.readAsText(file)
}

// PWA対応（Service Worker登録）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("そなログ Service Worker registered successfully")
      })
      .catch((error) => {
        console.log("そなログ Service Worker registration failed")
      })
  })
}
