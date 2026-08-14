/**
 * Country & Nationality Mapping Utilities
 * Provides comprehensive ISO 3166-1 alpha-2, country names, nationality demonyms, and flag indicators.
 */

export interface CountryInfo {
  code: string;       // 2-letter ISO uppercase (e.g., "NP", "DE", "PK", "US")
  full: string;       // Official/Common Country Name (e.g., "Nepal", "Germany", "Pakistan", "United States")
  name?: string;      // Alias for full
  nationality: string;// Demonym/Nationality (e.g., "Nepalese", "German", "Pakistani", "American")
  half: string;       // 3-letter abbreviation (e.g., "NEP", "GER", "PAK", "USA")
  flag: string;       // Unicode flag emoji (e.g., "🇳🇵", "🇩🇪", "🇵🇰", "🇺🇸")
}

export const COUNTRY_DATA: Record<string, CountryInfo> = {
  // Top / Common Immigration Nationalities & ISO list
  us: { code: "US", full: "United States", nationality: "American", half: "USA", flag: "🇺🇸" },
  usa: { code: "US", full: "United States", nationality: "American", half: "USA", flag: "🇺🇸" },
  american: { code: "US", full: "United States", nationality: "American", half: "USA", flag: "🇺🇸" },
  "united states": { code: "US", full: "United States", nationality: "American", half: "USA", flag: "🇺🇸" },
  "united states of america": { code: "US", full: "United States", nationality: "American", half: "USA", flag: "🇺🇸" },

  gb: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  gbr: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  uk: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  british: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  britain: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  "united kingdom": { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  english: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  scottish: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  welsh: { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },
  "northern irish": { code: "GB", full: "United Kingdom", nationality: "British", half: "UK", flag: "🇬🇧" },

  in: { code: "IN", full: "India", nationality: "Indian", half: "Ind", flag: "🇮🇳" },
  ind: { code: "IN", full: "India", nationality: "Indian", half: "Ind", flag: "🇮🇳" },
  india: { code: "IN", full: "India", nationality: "Indian", half: "Ind", flag: "🇮🇳" },
  indian: { code: "IN", full: "India", nationality: "Indian", half: "Ind", flag: "🇮🇳" },

  np: { code: "NP", full: "Nepal", nationality: "Nepalese", half: "Nep", flag: "🇳🇵" },
  npl: { code: "NP", full: "Nepal", nationality: "Nepalese", half: "Nep", flag: "🇳🇵" },
  nepal: { code: "NP", full: "Nepal", nationality: "Nepalese", half: "Nep", flag: "🇳🇵" },
  nepalese: { code: "NP", full: "Nepal", nationality: "Nepalese", half: "Nep", flag: "🇳🇵" },
  nepali: { code: "NP", full: "Nepal", nationality: "Nepalese", half: "Nep", flag: "🇳🇵" },

  de: { code: "DE", full: "Germany", nationality: "German", half: "Ger", flag: "🇩🇪" },
  deu: { code: "DE", full: "Germany", nationality: "German", half: "Ger", flag: "🇩🇪" },
  germany: { code: "DE", full: "Germany", nationality: "German", half: "Ger", flag: "🇩🇪" },
  german: { code: "DE", full: "Germany", nationality: "German", half: "Ger", flag: "🇩🇪" },

  pk: { code: "PK", full: "Pakistan", nationality: "Pakistani", half: "Pak", flag: "🇵🇰" },
  pak: { code: "PK", full: "Pakistan", nationality: "Pakistani", half: "Pak", flag: "🇵🇰" },
  pakistan: { code: "PK", full: "Pakistan", nationality: "Pakistani", half: "Pak", flag: "🇵🇰" },
  pakistani: { code: "PK", full: "Pakistan", nationality: "Pakistani", half: "Pak", flag: "🇵🇰" },

  cn: { code: "CN", full: "China", nationality: "Chinese", half: "Chn", flag: "🇨🇳" },
  chn: { code: "CN", full: "China", nationality: "Chinese", half: "Chn", flag: "🇨🇳" },
  china: { code: "CN", full: "China", nationality: "Chinese", half: "Chn", flag: "🇨🇳" },
  chinese: { code: "CN", full: "China", nationality: "Chinese", half: "Chn", flag: "🇨🇳" },

  fr: { code: "FR", full: "France", nationality: "French", half: "Fra", flag: "🇫🇷" },
  fra: { code: "FR", full: "France", nationality: "French", half: "Fra", flag: "🇫🇷" },
  france: { code: "FR", full: "France", nationality: "French", half: "Fra", flag: "🇫🇷" },
  french: { code: "FR", full: "France", nationality: "French", half: "Fra", flag: "🇫🇷" },

  za: { code: "ZA", full: "South Africa", nationality: "South African", half: "SA", flag: "🇿🇦" },
  sa: { code: "ZA", full: "South Africa", nationality: "South African", half: "SA", flag: "🇿🇦" },
  "south africa": { code: "ZA", full: "South Africa", nationality: "South African", half: "SA", flag: "🇿🇦" },
  "south african": { code: "ZA", full: "South Africa", nationality: "South African", half: "SA", flag: "🇿🇦" },

  it: { code: "IT", full: "Italy", nationality: "Italian", half: "Ita", flag: "🇮🇹" },
  ita: { code: "IT", full: "Italy", nationality: "Italian", half: "Ita", flag: "🇮🇹" },
  italy: { code: "IT", full: "Italy", nationality: "Italian", half: "Ita", flag: "🇮🇹" },
  italian: { code: "IT", full: "Italy", nationality: "Italian", half: "Ita", flag: "🇮🇹" },

  gl: { code: "GL", full: "Greenland", nationality: "Greenlandic", half: "Grl", flag: "🇬🇱" },
  grl: { code: "GL", full: "Greenland", nationality: "Greenlandic", half: "Grl", flag: "🇬🇱" },
  greenland: { code: "GL", full: "Greenland", nationality: "Greenlandic", half: "Grl", flag: "🇬🇱" },
  greenlandic: { code: "GL", full: "Greenland", nationality: "Greenlandic", half: "Grl", flag: "🇬🇱" },

  jm: { code: "JM", full: "Jamaica", nationality: "Jamaican", half: "Jam", flag: "🇯🇲" },
  jam: { code: "JM", full: "Jamaica", nationality: "Jamaican", half: "Jam", flag: "🇯🇲" },
  jamaica: { code: "JM", full: "Jamaica", nationality: "Jamaican", half: "Jam", flag: "🇯🇲" },
  jamaican: { code: "JM", full: "Jamaica", nationality: "Jamaican", half: "Jam", flag: "🇯🇲" },

  es: { code: "ES", full: "Spain", nationality: "Spanish", half: "Esp", flag: "🇪🇸" },
  esp: { code: "ES", full: "Spain", nationality: "Spanish", half: "Esp", flag: "🇪🇸" },
  spain: { code: "ES", full: "Spain", nationality: "Spanish", half: "Esp", flag: "🇪🇸" },
  spanish: { code: "ES", full: "Spain", nationality: "Spanish", half: "Esp", flag: "🇪🇸" },

  ca: { code: "CA", full: "Canada", nationality: "Canadian", half: "Can", flag: "🇨🇦" },
  can: { code: "CA", full: "Canada", nationality: "Canadian", half: "Can", flag: "🇨🇦" },
  canada: { code: "CA", full: "Canada", nationality: "Canadian", half: "Can", flag: "🇨🇦" },
  canadian: { code: "CA", full: "Canada", nationality: "Canadian", half: "Can", flag: "🇨🇦" },

  au: { code: "AU", full: "Australia", nationality: "Australian", half: "Aus", flag: "🇦🇺" },
  aus: { code: "AU", full: "Australia", nationality: "Australian", half: "Aus", flag: "🇦🇺" },
  australia: { code: "AU", full: "Australia", nationality: "Australian", half: "Aus", flag: "🇦🇺" },
  australian: { code: "AU", full: "Australia", nationality: "Australian", half: "Aus", flag: "🇦🇺" },

  br: { code: "BR", full: "Brazil", nationality: "Brazilian", half: "Bra", flag: "🇧🇷" },
  bra: { code: "BR", full: "Brazil", nationality: "Brazilian", half: "Bra", flag: "🇧🇷" },
  brazil: { code: "BR", full: "Brazil", nationality: "Brazilian", half: "Bra", flag: "🇧🇷" },
  brazilian: { code: "BR", full: "Brazil", nationality: "Brazilian", half: "Bra", flag: "🇧🇷" },

  ng: { code: "NG", full: "Nigeria", nationality: "Nigerian", half: "Nga", flag: "🇳🇬" },
  nga: { code: "NG", full: "Nigeria", nationality: "Nigerian", half: "Nga", flag: "🇳🇬" },
  nigeria: { code: "NG", full: "Nigeria", nationality: "Nigerian", half: "Nga", flag: "🇳🇬" },
  nigerian: { code: "NG", full: "Nigeria", nationality: "Nigerian", half: "Nga", flag: "🇳🇬" },

  gh: { code: "GH", full: "Ghana", nationality: "Ghanaian", half: "Gha", flag: "🇬🇭" },
  gha: { code: "GH", full: "Ghana", nationality: "Ghanaian", half: "Gha", flag: "🇬🇭" },
  ghana: { code: "GH", full: "Ghana", nationality: "Ghanaian", half: "Gha", flag: "🇬🇭" },
  ghanaian: { code: "GH", full: "Ghana", nationality: "Ghanaian", half: "Gha", flag: "🇬🇭" },

  bd: { code: "BD", full: "Bangladesh", nationality: "Bangladeshi", half: "Bgd", flag: "🇧🇩" },
  bgd: { code: "BD", full: "Bangladesh", nationality: "Bangladeshi", half: "Bgd", flag: "🇧🇩" },
  bangladesh: { code: "BD", full: "Bangladesh", nationality: "Bangladeshi", half: "Bgd", flag: "🇧🇩" },
  bangladeshi: { code: "BD", full: "Bangladesh", nationality: "Bangladeshi", half: "Bgd", flag: "🇧🇩" },

  ph: { code: "PH", full: "Philippines", nationality: "Filipino", half: "Phl", flag: "🇵🇭" },
  phl: { code: "PH", full: "Philippines", nationality: "Filipino", half: "Phl", flag: "🇵🇭" },
  philippines: { code: "PH", full: "Philippines", nationality: "Filipino", half: "Phl", flag: "🇵🇭" },
  filipino: { code: "PH", full: "Philippines", nationality: "Filipino", half: "Phl", flag: "🇵🇭" },

  jp: { code: "JP", full: "Japan", nationality: "Japanese", half: "Jpn", flag: "🇯🇵" },
  jpn: { code: "JP", full: "Japan", nationality: "Japanese", half: "Jpn", flag: "🇯🇵" },
  japan: { code: "JP", full: "Japan", nationality: "Japanese", half: "Jpn", flag: "🇯🇵" },
  japanese: { code: "JP", full: "Japan", nationality: "Japanese", half: "Jpn", flag: "🇯🇵" },

  ie: { code: "IE", full: "Ireland", nationality: "Irish", half: "Irl", flag: "🇮🇪" },
  irl: { code: "IE", full: "Ireland", nationality: "Irish", half: "Irl", flag: "🇮🇪" },
  ireland: { code: "IE", full: "Ireland", nationality: "Irish", half: "Irl", flag: "🇮🇪" },
  irish: { code: "IE", full: "Ireland", nationality: "Irish", half: "Irl", flag: "🇮🇪" },

  pl: { code: "PL", full: "Poland", nationality: "Polish", half: "Pol", flag: "🇵🇱" },
  pol: { code: "PL", full: "Poland", nationality: "Polish", half: "Pol", flag: "🇵🇱" },
  poland: { code: "PL", full: "Poland", nationality: "Polish", half: "Pol", flag: "🇵🇱" },
  polish: { code: "PL", full: "Poland", nationality: "Polish", half: "Pol", flag: "🇵🇱" },

  nl: { code: "NL", full: "Netherlands", nationality: "Dutch", half: "Nld", flag: "🇳🇱" },
  nld: { code: "NL", full: "Netherlands", nationality: "Dutch", half: "Nld", flag: "🇳🇱" },
  netherlands: { code: "NL", full: "Netherlands", nationality: "Dutch", half: "Nld", flag: "🇳🇱" },
  dutch: { code: "NL", full: "Netherlands", nationality: "Dutch", half: "Nld", flag: "🇳🇱" },

  pt: { code: "PT", full: "Portugal", nationality: "Portuguese", half: "Prt", flag: "🇵🇹" },
  prt: { code: "PT", full: "Portugal", nationality: "Portuguese", half: "Prt", flag: "🇵🇹" },
  portugal: { code: "PT", full: "Portugal", nationality: "Portuguese", half: "Prt", flag: "🇵🇹" },
  portuguese: { code: "PT", full: "Portugal", nationality: "Portuguese", half: "Prt", flag: "🇵🇹" },

  ro: { code: "RO", full: "Romania", nationality: "Romanian", half: "Rou", flag: "🇷🇴" },
  rou: { code: "RO", full: "Romania", nationality: "Romanian", half: "Rou", flag: "🇷🇴" },
  romania: { code: "RO", full: "Romania", nationality: "Romanian", half: "Rou", flag: "🇷🇴" },
  romanian: { code: "RO", full: "Romania", nationality: "Romanian", half: "Rou", flag: "🇷🇴" },

  tr: { code: "TR", full: "Turkey", nationality: "Turkish", half: "Tur", flag: "🇹🇷" },
  tur: { code: "TR", full: "Turkey", nationality: "Turkish", half: "Tur", flag: "🇹🇷" },
  turkey: { code: "TR", full: "Turkey", nationality: "Turkish", half: "Tur", flag: "🇹🇷" },
  turkish: { code: "TR", full: "Turkey", nationality: "Turkish", half: "Tur", flag: "🇹🇷" },

  ua: { code: "UA", full: "Ukraine", nationality: "Ukrainian", half: "Ukr", flag: "🇺🇦" },
  ukr: { code: "UA", full: "Ukraine", nationality: "Ukrainian", half: "Ukr", flag: "🇺🇦" },
  ukraine: { code: "UA", full: "Ukraine", nationality: "Ukrainian", half: "Ukr", flag: "🇺🇦" },
  ukrainian: { code: "UA", full: "Ukraine", nationality: "Ukrainian", half: "Ukr", flag: "🇺🇦" },

  se: { code: "SE", full: "Sweden", nationality: "Swedish", half: "Swe", flag: "🇸🇪" },
  swe: { code: "SE", full: "Sweden", nationality: "Swedish", half: "Swe", flag: "🇸🇪" },
  sweden: { code: "SE", full: "Sweden", nationality: "Swedish", half: "Swe", flag: "🇸🇪" },
  swedish: { code: "SE", full: "Sweden", nationality: "Swedish", half: "Swe", flag: "🇸🇪" },

  no: { code: "NO", full: "Norway", nationality: "Norwegian", half: "Nor", flag: "🇳🇴" },
  nor: { code: "NO", full: "Norway", nationality: "Norwegian", half: "Nor", flag: "🇳🇴" },
  norway: { code: "NO", full: "Norway", nationality: "Norwegian", half: "Nor", flag: "🇳🇴" },
  norwegian: { code: "NO", full: "Norway", nationality: "Norwegian", half: "Nor", flag: "🇳🇴" },

  dk: { code: "DK", full: "Denmark", nationality: "Danish", half: "Dnk", flag: "🇩🇰" },
  dnk: { code: "DK", full: "Denmark", nationality: "Danish", half: "Dnk", flag: "🇩🇰" },
  denmark: { code: "DK", full: "Denmark", nationality: "Danish", half: "Dnk", flag: "🇩🇰" },
  danish: { code: "DK", full: "Denmark", nationality: "Danish", half: "Dnk", flag: "🇩🇰" },

  fi: { code: "FI", full: "Finland", nationality: "Finnish", half: "Fin", flag: "🇫🇮" },
  fin: { code: "FI", full: "Finland", nationality: "Finnish", half: "Fin", flag: "🇫🇮" },
  finland: { code: "FI", full: "Finland", nationality: "Finnish", half: "Fin", flag: "🇫🇮" },
  finnish: { code: "FI", full: "Finland", nationality: "Finnish", half: "Fin", flag: "🇫🇮" },

  gr: { code: "GR", full: "Greece", nationality: "Greek", half: "Grc", flag: "🇬🇷" },
  grc: { code: "GR", full: "Greece", nationality: "Greek", half: "Grc", flag: "🇬🇷" },
  greece: { code: "GR", full: "Greece", nationality: "Greek", half: "Grc", flag: "🇬🇷" },
  greek: { code: "GR", full: "Greece", nationality: "Greek", half: "Grc", flag: "🇬🇷" },

  ch: { code: "CH", full: "Switzerland", nationality: "Swiss", half: "Che", flag: "🇨🇭" },
  che: { code: "CH", full: "Switzerland", nationality: "Swiss", half: "Che", flag: "🇨🇭" },
  switzerland: { code: "CH", full: "Switzerland", nationality: "Swiss", half: "Che", flag: "🇨🇭" },
  swiss: { code: "CH", full: "Switzerland", nationality: "Swiss", half: "Che", flag: "🇨🇭" },

  at: { code: "AT", full: "Austria", nationality: "Austrian", half: "Aut", flag: "🇦🇹" },
  aut: { code: "AT", full: "Austria", nationality: "Austrian", half: "Aut", flag: "🇦🇹" },
  austria: { code: "AT", full: "Austria", nationality: "Austrian", half: "Aut", flag: "🇦🇹" },
  austrian: { code: "AT", full: "Austria", nationality: "Austrian", half: "Aut", flag: "🇦🇹" },

  be: { code: "BE", full: "Belgium", nationality: "Belgian", half: "Bel", flag: "🇧🇪" },
  bel: { code: "BE", full: "Belgium", nationality: "Belgian", half: "Bel", flag: "🇧🇪" },
  belgium: { code: "BE", full: "Belgium", nationality: "Belgian", half: "Bel", flag: "🇧🇪" },
  belgian: { code: "BE", full: "Belgium", nationality: "Belgian", half: "Bel", flag: "🇧🇪" },

  nz: { code: "NZ", full: "New Zealand", nationality: "New Zealander", half: "Nzl", flag: "🇳🇿" },
  nzl: { code: "NZ", full: "New Zealand", nationality: "New Zealander", half: "Nzl", flag: "🇳🇿" },
  "new zealand": { code: "NZ", full: "New Zealand", nationality: "New Zealander", half: "Nzl", flag: "🇳🇿" },
  "new zealander": { code: "NZ", full: "New Zealand", nationality: "New Zealander", half: "Nzl", flag: "🇳🇿" },

  ke: { code: "KE", full: "Kenya", nationality: "Kenyan", half: "Ken", flag: "🇰🇪" },
  ken: { code: "KE", full: "Kenya", nationality: "Kenyan", half: "Ken", flag: "🇰🇪" },
  kenya: { code: "KE", full: "Kenya", nationality: "Kenyan", half: "Ken", flag: "🇰🇪" },
  kenyan: { code: "KE", full: "Kenya", nationality: "Kenyan", half: "Ken", flag: "🇰🇪" },

  zw: { code: "ZW", full: "Zimbabwe", nationality: "Zimbabwean", half: "Zwe", flag: "🇿🇼" },
  zwe: { code: "ZW", full: "Zimbabwe", nationality: "Zimbabwean", half: "Zwe", flag: "🇿🇼" },
  zimbabwe: { code: "ZW", full: "Zimbabwe", nationality: "Zimbabwean", half: "Zwe", flag: "🇿🇼" },
  zimbabwean: { code: "ZW", full: "Zimbabwe", nationality: "Zimbabwean", half: "Zwe", flag: "🇿🇼" },

  eg: { code: "EG", full: "Egypt", nationality: "Egyptian", half: "Egy", flag: "🇪🇬" },
  egy: { code: "EG", full: "Egypt", nationality: "Egyptian", half: "Egy", flag: "🇪🇬" },
  egypt: { code: "EG", full: "Egypt", nationality: "Egyptian", half: "Egy", flag: "🇪🇬" },
  egyptian: { code: "EG", full: "Egypt", nationality: "Egyptian", half: "Egy", flag: "🇪🇬" },

  lk: { code: "LK", full: "Sri Lanka", nationality: "Sri Lankan", half: "Lka", flag: "🇱🇰" },
  lka: { code: "LK", full: "Sri Lanka", nationality: "Sri Lankan", half: "Lka", flag: "🇱🇰" },
  "sri lanka": { code: "LK", full: "Sri Lanka", nationality: "Sri Lankan", half: "Lka", flag: "🇱🇰" },
  "sri lankan": { code: "LK", full: "Sri Lanka", nationality: "Sri Lankan", half: "Lka", flag: "🇱🇰" },

  vn: { code: "VN", full: "Vietnam", nationality: "Vietnamese", half: "Vnm", flag: "🇻🇳" },
  vnm: { code: "VN", full: "Vietnam", nationality: "Vietnamese", half: "Vnm", flag: "🇻🇳" },
  vietnam: { code: "VN", full: "Vietnam", nationality: "Vietnamese", half: "Vnm", flag: "🇻🇳" },
  vietnamese: { code: "VN", full: "Vietnam", nationality: "Vietnamese", half: "Vnm", flag: "🇻🇳" },

  th: { code: "TH", full: "Thailand", nationality: "Thai", half: "Tha", flag: "🇹🇭" },
  tha: { code: "TH", full: "Thailand", nationality: "Thai", half: "Tha", flag: "🇹🇭" },
  thailand: { code: "TH", full: "Thailand", nationality: "Thai", half: "Tha", flag: "🇹🇭" },
  thai: { code: "TH", full: "Thailand", nationality: "Thai", half: "Tha", flag: "🇹🇭" },

  id: { code: "ID", full: "Indonesia", nationality: "Indonesian", half: "Idn", flag: "🇮🇩" },
  idn: { code: "ID", full: "Indonesia", nationality: "Indonesian", half: "Idn", flag: "🇮🇩" },
  indonesia: { code: "ID", full: "Indonesia", nationality: "Indonesian", half: "Idn", flag: "🇮🇩" },
  indonesian: { code: "ID", full: "Indonesia", nationality: "Indonesian", half: "Idn", flag: "🇮🇩" },

  my: { code: "MY", full: "Malaysia", nationality: "Malaysian", half: "Mys", flag: "🇲🇾" },
  mys: { code: "MY", full: "Malaysia", nationality: "Malaysian", half: "Mys", flag: "🇲🇾" },
  malaysia: { code: "MY", full: "Malaysia", nationality: "Malaysian", half: "Mys", flag: "🇲🇾" },
  malaysian: { code: "MY", full: "Malaysia", nationality: "Malaysian", half: "Mys", flag: "🇲🇾" },

  sg: { code: "SG", full: "Singapore", nationality: "Singaporean", half: "Sgp", flag: "🇸🇬" },
  sgp: { code: "SG", full: "Singapore", nationality: "Singaporean", half: "Sgp", flag: "🇸🇬" },
  singapore: { code: "SG", full: "Singapore", nationality: "Singaporean", half: "Sgp", flag: "🇸🇬" },
  singaporean: { code: "SG", full: "Singapore", nationality: "Singaporean", half: "Sgp", flag: "🇸🇬" },

  kr: { code: "KR", full: "South Korea", nationality: "South Korean", half: "Kor", flag: "🇰🇷" },
  kor: { code: "KR", full: "South Korea", nationality: "South Korean", half: "Kor", flag: "🇰🇷" },
  "south korea": { code: "KR", full: "South Korea", nationality: "South Korean", half: "Kor", flag: "🇰🇷" },
  "south korean": { code: "KR", full: "South Korea", nationality: "South Korean", half: "Kor", flag: "🇰🇷" },
  korean: { code: "KR", full: "South Korea", nationality: "South Korean", half: "Kor", flag: "🇰🇷" },

  mx: { code: "MX", full: "Mexico", nationality: "Mexican", half: "Mex", flag: "🇲🇽" },
  mex: { code: "MX", full: "Mexico", nationality: "Mexican", half: "Mex", flag: "🇲🇽" },
  mexico: { code: "MX", full: "Mexico", nationality: "Mexican", half: "Mex", flag: "🇲🇽" },
  mexican: { code: "MX", full: "Mexico", nationality: "Mexican", half: "Mex", flag: "🇲🇽" },

  ar: { code: "AR", full: "Argentina", nationality: "Argentine", half: "Arg", flag: "🇦🇷" },
  arg: { code: "AR", full: "Argentina", nationality: "Argentine", half: "Arg", flag: "🇦🇷" },
  argentina: { code: "AR", full: "Argentina", nationality: "Argentine", half: "Arg", flag: "🇦🇷" },
  argentine: { code: "AR", full: "Argentina", nationality: "Argentine", half: "Arg", flag: "🇦🇷" },
  argentinian: { code: "AR", full: "Argentina", nationality: "Argentine", half: "Arg", flag: "🇦🇷" },

  co: { code: "CO", full: "Colombia", nationality: "Colombian", half: "Col", flag: "🇨🇴" },
  col: { code: "CO", full: "Colombia", nationality: "Colombian", half: "Col", flag: "🇨🇴" },
  colombia: { code: "CO", full: "Colombia", nationality: "Colombian", half: "Col", flag: "🇨🇴" },
  colombian: { code: "CO", full: "Colombia", nationality: "Colombian", half: "Col", flag: "🇨🇴" },

  cl: { code: "CL", full: "Chile", nationality: "Chilean", half: "Chl", flag: "🇨🇱" },
  chl: { code: "CL", full: "Chile", nationality: "Chilean", half: "Chl", flag: "🇨🇱" },
  chile: { code: "CL", full: "Chile", nationality: "Chilean", half: "Chl", flag: "🇨🇱" },
  chilean: { code: "CL", full: "Chile", nationality: "Chilean", half: "Chl", flag: "🇨🇱" },
};

export const FLAG_UNICODE_MAP: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", IN: "🇮🇳", NP: "🇳🇵", DE: "🇩🇪", PK: "🇵🇰",
  CN: "🇨🇳", FR: "🇫🇷", ZA: "🇿🇦", IT: "🇮🇹", GL: "🇬🇱", JM: "🇯🇲",
  ES: "🇪🇸", CA: "🇨🇦", AU: "🇦🇺", BR: "🇧🇷", NG: "🇳🇬", GH: "🇬🇭",
  BD: "🇧🇩", PH: "🇵🇭", JP: "🇯🇵", IE: "🇮🇪", PL: "🇵🇱", NL: "🇳🇱",
  PT: "🇵🇹", RO: "🇷🇴", TR: "🇹🇷", UA: "🇺🇦", SE: "🇸🇪", NO: "🇳🇴",
  DK: "🇩🇰", FI: "🇫🇮", GR: "🇬🇷", CH: "🇨🇭", AT: "🇦🇹", BE: "🇧🇪",
  NZ: "🇳🇿", KE: "🇰🇪", ZW: "🇿🇼", EG: "🇪🇬", LK: "🇱🇰", VN: "🇻🇳",
  TH: "🇹🇭", ID: "🇮🇩", MY: "🇲🇾", SG: "🇸🇬", KR: "🇰🇷", MX: "🇲🇽",
  AR: "🇦🇷", CO: "🇨🇴", CL: "🇨🇱",
};

/**
 * Extracts and normalizes country/nationality information from any raw value.
 * Accepts strings (e.g. "nepalese", "germany", "PK", "US"), or objects (from API payloads).
 */
export function getCountryInfo(raw?: any): CountryInfo {
  if (!raw) {
    return { code: "UN", full: "Unknown", name: "Unknown", nationality: "Unknown", half: "UNK", flag: "🌐" };
  }

  let str = "";
  if (typeof raw === "string") {
    str = raw;
  } else if (typeof raw === "object") {
    str = raw.value || raw.name || raw.title || raw.code || raw.country || "";
  }

  const clean = str.trim().toLowerCase().replace(/[_\-]+/g, " ");
  if (!clean) {
    return { code: "UN", full: "Unknown", name: "Unknown", nationality: "Unknown", half: "UNK", flag: "🌐" };
  }

  if (COUNTRY_DATA[clean]) {
    const data = COUNTRY_DATA[clean];
    return {
      ...data,
      name: data.full,
    };
  }

  // Format capitalized words
  const words = clean.split(" ");
  const full = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const code = (clean.length === 2 ? clean : clean.slice(0, 2)).toUpperCase();
  const half = full.length > 3 ? full.slice(0, 3).toUpperCase() : full.toUpperCase();
  const flag = FLAG_UNICODE_MAP[code] || "🌐";

  return {
    code,
    full,
    name: full,
    nationality: full,
    half,
    flag,
  };
}
