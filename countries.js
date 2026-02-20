/**
 * AllTime — Countries Data
 * Add or edit entries to customize the country list.
 * Format: { id, label, city, timezone, flag }
 * Timezone must be a valid IANA timezone string.
 */

const COUNTRIES = [
  // Asia
  { id: "in", label: "India", city: "Mumbai", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "jp", label: "Japan", city: "Tokyo", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "sg", label: "Singapore", city: "Singapore", timezone: "Asia/Singapore", flag: "🇸🇬" },
  { id: "cn", label: "China", city: "Shanghai", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "hk", label: "Hong Kong", city: "Hong Kong", timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
  { id: "kr", label: "South Korea", city: "Seoul", timezone: "Asia/Seoul", flag: "🇰🇷" },
  { id: "ae", label: "UAE", city: "Dubai", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { id: "sa", label: "Saudi Arabia", city: "Riyadh", timezone: "Asia/Riyadh", flag: "🇸🇦" },
  { id: "pk", label: "Pakistan", city: "Karachi", timezone: "Asia/Karachi", flag: "🇵🇰" },
  { id: "bd", label: "Bangladesh", city: "Dhaka", timezone: "Asia/Dhaka", flag: "🇧🇩" },
  { id: "lk", label: "Sri Lanka", city: "Colombo", timezone: "Asia/Colombo", flag: "🇱🇰" },
  { id: "np", label: "Nepal", city: "Kathmandu", timezone: "Asia/Kathmandu", flag: "🇳🇵" },
  { id: "my", label: "Malaysia", city: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  { id: "th", label: "Thailand", city: "Bangkok", timezone: "Asia/Bangkok", flag: "🇹🇭" },
  { id: "id", label: "Indonesia", city: "Jakarta", timezone: "Asia/Jakarta", flag: "🇮🇩" },
  { id: "ph", label: "Philippines", city: "Manila", timezone: "Asia/Manila", flag: "🇵🇭" },
  { id: "vn", label: "Vietnam", city: "Ho Chi Minh", timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  { id: "il", label: "Israel", city: "Tel Aviv", timezone: "Asia/Jerusalem", flag: "🇮🇱" },
  { id: "tr", label: "Turkey", city: "Istanbul", timezone: "Europe/Istanbul", flag: "🇹🇷" },

  // Europe
  { id: "gb", label: "United Kingdom", city: "London", timezone: "Europe/London", flag: "🇬🇧" },
  { id: "de", label: "Germany", city: "Berlin", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { id: "fr", label: "France", city: "Paris", timezone: "Europe/Paris", flag: "🇫🇷" },
  { id: "nl", label: "Netherlands", city: "Amsterdam", timezone: "Europe/Amsterdam", flag: "🇳🇱" },
  { id: "ch", label: "Switzerland", city: "Zurich", timezone: "Europe/Zurich", flag: "🇨🇭" },
  { id: "se", label: "Sweden", city: "Stockholm", timezone: "Europe/Stockholm", flag: "🇸🇪" },
  { id: "no", label: "Norway", city: "Oslo", timezone: "Europe/Oslo", flag: "🇳🇴" },
  { id: "fi", label: "Finland", city: "Helsinki", timezone: "Europe/Helsinki", flag: "🇫🇮" },
  { id: "es", label: "Spain", city: "Madrid", timezone: "Europe/Madrid", flag: "🇪🇸" },
  { id: "it", label: "Italy", city: "Rome", timezone: "Europe/Rome", flag: "🇮🇹" },
  { id: "ru", label: "Russia", city: "Moscow", timezone: "Europe/Moscow", flag: "🇷🇺" },
  { id: "pl", label: "Poland", city: "Warsaw", timezone: "Europe/Warsaw", flag: "🇵🇱" },
  { id: "ua", label: "Ukraine", city: "Kyiv", timezone: "Europe/Kiev", flag: "🇺🇦" },
  { id: "pt", label: "Portugal", city: "Lisbon", timezone: "Europe/Lisbon", flag: "🇵🇹" },

  // Americas
  { id: "us-ny", label: "USA", city: "New York", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "us-la", label: "USA (West)", city: "Los Angeles", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "us-ch", label: "USA (Central)", city: "Chicago", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "ca", label: "Canada", city: "Toronto", timezone: "America/Toronto", flag: "🇨🇦" },
  { id: "ca-v", label: "Canada (West)", city: "Vancouver", timezone: "America/Vancouver", flag: "🇨🇦" },
  { id: "mx", label: "Mexico", city: "Mexico City", timezone: "America/Mexico_City", flag: "🇲🇽" },
  { id: "br", label: "Brazil", city: "São Paulo", timezone: "America/Sao_Paulo", flag: "🇧🇷" },
  { id: "ar", label: "Argentina", city: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
  { id: "co", label: "Colombia", city: "Bogotá", timezone: "America/Bogota", flag: "🇨🇴" },
  { id: "cl", label: "Chile", city: "Santiago", timezone: "America/Santiago", flag: "🇨🇱" },

  // Africa & Oceania
  { id: "za", label: "South Africa", city: "Johannesburg", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { id: "ng", label: "Nigeria", city: "Lagos", timezone: "Africa/Lagos", flag: "🇳🇬" },
  { id: "ke", label: "Kenya", city: "Nairobi", timezone: "Africa/Nairobi", flag: "🇰🇪" },
  { id: "eg", label: "Egypt", city: "Cairo", timezone: "Africa/Cairo", flag: "🇪🇬" },
  { id: "au", label: "Australia", city: "Sydney", timezone: "Australia/Sydney", flag: "🇦🇺" },
  { id: "au-m", label: "Australia (West)", city: "Melbourne", timezone: "Australia/Melbourne", flag: "🇦🇺" },
  { id: "nz", label: "New Zealand", city: "Auckland", timezone: "Pacific/Auckland", flag: "🇳🇿" },
];

// Export for use in popup.js
if (typeof module !== "undefined") module.exports = COUNTRIES;
