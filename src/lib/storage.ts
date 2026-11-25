// Lưu dữ liệu nhỏ trên máy (ngôn ngữ, tiến độ). Không gửi đi đâu.
// localStorage có thể bị chặn (chế độ riêng tư), nên luôn bọc try/catch.

const PREFIX = 'klg:'

export function loadValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function saveValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Bỏ qua: game vẫn chạy bình thường khi không lưu được.
  }
}
