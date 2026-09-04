// System Configuration and Constants
export const APP_CONFIG = {
  STORAGE_KEYS: {
    CURRENT_TRIP: 'smart_packing_current_trip',
    SAVED_TRIPS: 'smart_packing_saved_trips',
    SETTINGS: 'smart_packing_settings'
  },
  MAX_DAYS: 16,
  MIN_DAYS: 1,
  DEFAULT_DAYS: 4,
  POPULAR_CITIES: [
    { name: 'Tokyo', country: 'Japan', query: 'Tokyo' },
    { name: 'Seoul', country: 'South Korea', query: 'Seoul' },
    { name: 'London', country: 'UK', query: 'London' },
    { name: 'Paris', country: 'France', query: 'Paris' },
    { name: 'Chiang Mai', country: 'Thailand', query: 'Chiang Mai' },
    { name: 'Singapore', country: 'Singapore', query: 'Singapore' },
    { name: 'Reykjavik', country: 'Iceland', query: 'Reykjavik' },
    { name: 'Bangkok', country: 'Thailand', query: 'Bangkok' },
    { name: 'Sapporo', country: 'Japan', query: 'Sapporo' }
  ]
};

export const CATEGORIES = {
  DOCUMENTS: {
    id: 'documents',
    name: 'เอกสาร & การเงิน',
    icon: 'fa-passport',
    color: 'amber'
  },
  CLOTHING: {
    id: 'clothing',
    name: 'เสื้อผ้า & เครื่องแต่งกาย',
    icon: 'fa-shirt',
    color: 'indigo'
  },
  WEATHER_GEAR: {
    id: 'weather_gear',
    name: 'อุปกรณ์รับมือสภาพอากาศ',
    icon: 'fa-cloud-sun-rain',
    color: 'sky'
  },
  ELECTRONICS: {
    id: 'electronics',
    name: 'อุปกรณ์อิเล็กทรอนิกส์',
    icon: 'fa-laptop',
    color: 'purple'
  },
  TOILETRIES: {
    id: 'toiletries',
    name: 'ของใช้ส่วนตัว & สุขภาพ',
    icon: 'fa-pump-soap',
    color: 'emerald'
  },
  CUSTOM: {
    id: 'custom',
    name: 'รายการเพิ่มเติมที่คุณระบุ',
    icon: 'fa-list-check',
    color: 'rose'
  }
};

// WMO Weather interpretation codes (WW)
export const WMO_WEATHER_CODES = {
  0: { label: 'ท้องฟ้าแจ่มใส', icon: '☀️', condition: 'clear' },
  1: { label: 'โปร่งเป็นส่วนใหญ่', icon: '🌤️', condition: 'mainly_clear' },
  2: { label: 'มีเมฆบางส่วน', icon: '⛅', condition: 'partly_cloudy' },
  3: { label: 'มีเมฆมาก', icon: '☁️', condition: 'overcast' },
  45: { label: 'มีหมอกหนา', icon: '🌫️', condition: 'fog' },
  48: { label: 'มีหมอกน้ำค้างแข็ง', icon: '🌫️', condition: 'fog' },
  51: { label: 'ฝนปรอยเบาบาง', icon: '🌦️', condition: 'drizzle' },
  53: { label: 'ฝนปรอยปานกลาง', icon: '🌦️', condition: 'drizzle' },
  55: { label: 'ฝนปรอยหนาแน่น', icon: '🌧️', condition: 'drizzle' },
  61: { label: 'ฝนตกเล็กน้อย', icon: '🌧️', condition: 'rain' },
  63: { label: 'ฝนตกปานกลาง', icon: '🌧️', condition: 'rain' },
  65: { label: 'ฝนตกหนัก', icon: '🌧️', condition: 'heavy_rain' },
  71: { label: 'หิมะตกเล็กน้อย', icon: '🌨️', condition: 'snow' },
  73: { label: 'หิมะตกปานกลาง', icon: '🌨️', condition: 'snow' },
  75: { label: 'หิมะตกหนัก', icon: '❄️', condition: 'heavy_snow' },
  77: { label: 'เกล็ดหิมะโปรยปราย', icon: '❄️', condition: 'snow' },
  80: { label: 'ฝนตกเป็นช่วงๆ', icon: '🌦️', condition: 'rain' },
  81: { label: 'ฝนตกชุกปานกลาง', icon: '🌧️', condition: 'rain' },
  82: { label: 'ฝนตกชุกรุนแรง', icon: '⛈️', condition: 'heavy_rain' },
  85: { label: 'พายุหิมะเบาบาง', icon: '🌨️', condition: 'snow' },
  86: { label: 'พายุหิมะหนัก', icon: '❄️', condition: 'heavy_snow' },
  95: { label: 'พายุฝนฟ้าคะนอง', icon: '⛈️', condition: 'thunderstorm' },
  96: { label: 'พายุฝนฟ้าคะนองมีลูกเห็บตกเล็กน้อย', icon: '⛈️', condition: 'thunderstorm' },
  99: { label: 'พายุฝนฟ้าคะนองมีลูกเห็บตกหนัก', icon: '⛈️', condition: 'thunderstorm' }
};
