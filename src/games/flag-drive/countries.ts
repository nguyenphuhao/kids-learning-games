// Các nước trong trò "Lái xe tìm cờ". Hình cờ: bộ flag-icons (MIT, github.com/lipis/flag-icons),
// file public/assets/flags/<code>.svg, tỉ lệ 4:3.
//
// Trò chơi chia thành từng vòng, mỗi vòng tìm 5 lá cờ. Xong một vòng thì sang vòng mới:
// đổi cảnh nền và khó dần lên (xem STAGES).

import type { Lang } from '../../i18n/strings'
import type { Level } from '../shared/useLevel'

export type Country = { code: string; name: Record<Lang, string> }

const c = (code: string, vi: string, en: string): Country => ({ code, name: { vi, en } })

export const COUNTRIES: Country[] = [
  // Châu Á
  c('VN', 'Việt Nam', 'Vietnam'),
  c('CN', 'Trung Quốc', 'China'),
  c('JP', 'Nhật Bản', 'Japan'),
  c('KR', 'Hàn Quốc', 'South Korea'),
  c('TH', 'Thái Lan', 'Thailand'),
  c('IN', 'Ấn Độ', 'India'),
  c('ID', 'Indonesia', 'Indonesia'),
  c('MY', 'Malaysia', 'Malaysia'),
  c('SG', 'Singapore', 'Singapore'),
  c('PH', 'Philippines', 'the Philippines'),
  c('LA', 'Lào', 'Laos'),
  c('KH', 'Campuchia', 'Cambodia'),
  c('MM', 'Myanmar', 'Myanmar'),
  c('BN', 'Brunei', 'Brunei'),
  c('MN', 'Mông Cổ', 'Mongolia'),
  c('NP', 'Nepal', 'Nepal'),
  c('BD', 'Bangladesh', 'Bangladesh'),
  c('PK', 'Pakistan', 'Pakistan'),
  c('LK', 'Sri Lanka', 'Sri Lanka'),
  c('BT', 'Bhutan', 'Bhutan'),
  c('KZ', 'Kazakhstan', 'Kazakhstan'),
  c('SA', 'Ả Rập Xê Út', 'Saudi Arabia'),
  c('LB', 'Li-băng', 'Lebanon'),
  c('QA', 'Qatar', 'Qatar'),
  c('IL', 'Israel', 'Israel'),
  c('TR', 'Thổ Nhĩ Kỳ', 'Turkey'),
  c('IR', 'Iran', 'Iran'),
  c('JO', 'Jordan', 'Jordan'),
  c('KW', 'Kuwait', 'Kuwait'),
  // Châu Âu
  c('GB', 'Anh', 'the United Kingdom'),
  c('FR', 'Pháp', 'France'),
  c('DE', 'Đức', 'Germany'),
  c('IT', 'Ý', 'Italy'),
  c('NO', 'Na Uy', 'Norway'),
  c('SE', 'Thuỵ Điển', 'Sweden'),
  c('FI', 'Phần Lan', 'Finland'),
  c('DK', 'Đan Mạch', 'Denmark'),
  c('IS', 'Iceland', 'Iceland'),
  c('IE', 'Ireland', 'Ireland'),
  c('NL', 'Hà Lan', 'the Netherlands'),
  c('BE', 'Bỉ', 'Belgium'),
  c('LU', 'Luxembourg', 'Luxembourg'),
  c('CH', 'Thuỵ Sĩ', 'Switzerland'),
  c('AT', 'Áo', 'Austria'),
  c('ES', 'Tây Ban Nha', 'Spain'),
  c('PT', 'Bồ Đào Nha', 'Portugal'),
  c('GR', 'Hy Lạp', 'Greece'),
  c('PL', 'Ba Lan', 'Poland'),
  c('CZ', 'Séc', 'the Czech Republic'),
  c('SK', 'Slovakia', 'Slovakia'),
  c('HU', 'Hungary', 'Hungary'),
  c('RO', 'Romania', 'Romania'),
  c('BG', 'Bulgaria', 'Bulgaria'),
  c('UA', 'Ukraina', 'Ukraine'),
  c('RU', 'Nga', 'Russia'),
  c('HR', 'Croatia', 'Croatia'),
  c('RS', 'Serbia', 'Serbia'),
  c('SI', 'Slovenia', 'Slovenia'),
  c('EE', 'Estonia', 'Estonia'),
  c('LV', 'Latvia', 'Latvia'),
  c('LT', 'Litva', 'Lithuania'),
  c('MT', 'Malta', 'Malta'),
  c('CY', 'Síp', 'Cyprus'),
  c('AL', 'Albania', 'Albania'),
  // Châu Mỹ
  c('US', 'Mỹ', 'the United States'),
  c('CA', 'Canada', 'Canada'),
  c('MX', 'Mexico', 'Mexico'),
  c('BR', 'Brazil', 'Brazil'),
  c('AR', 'Argentina', 'Argentina'),
  c('CL', 'Chile', 'Chile'),
  c('CO', 'Colombia', 'Colombia'),
  c('PE', 'Peru', 'Peru'),
  c('VE', 'Venezuela', 'Venezuela'),
  c('UY', 'Uruguay', 'Uruguay'),
  c('PY', 'Paraguay', 'Paraguay'),
  c('BO', 'Bolivia', 'Bolivia'),
  c('EC', 'Ecuador', 'Ecuador'),
  c('CU', 'Cuba', 'Cuba'),
  c('JM', 'Jamaica', 'Jamaica'),
  c('BS', 'Bahamas', 'the Bahamas'),
  c('PA', 'Panama', 'Panama'),
  c('CR', 'Costa Rica', 'Costa Rica'),
  // Châu Phi
  c('EG', 'Ai Cập', 'Egypt'),
  c('ZA', 'Nam Phi', 'South Africa'),
  c('NG', 'Nigeria', 'Nigeria'),
  c('KE', 'Kenya', 'Kenya'),
  c('MA', 'Ma-rốc', 'Morocco'),
  c('GH', 'Ghana', 'Ghana'),
  c('ET', 'Ethiopia', 'Ethiopia'),
  c('SN', 'Senegal', 'Senegal'),
  c('CM', 'Cameroon', 'Cameroon'),
  c('DZ', 'Algeria', 'Algeria'),
  c('TN', 'Tunisia', 'Tunisia'),
  c('TZ', 'Tanzania', 'Tanzania'),
  c('CI', 'Bờ Biển Ngà', 'Ivory Coast'),
  c('MG', 'Madagascar', 'Madagascar'),
  // Châu Đại Dương
  c('AU', 'Úc', 'Australia'),
  c('NZ', 'New Zealand', 'New Zealand'),
  c('FJ', 'Fiji', 'Fiji'),
  c('PG', 'Papua New Guinea', 'Papua New Guinea'),
]

// Nhóm A: cờ quen thuộc, khác nhau rõ ràng (vòng đầu).
export const GROUP_A = ['VN', 'US', 'JP', 'KR', 'FR', 'BR', 'CA', 'GB', 'DE', 'IN', 'TH', 'CH', 'SE', 'GR', 'MX', 'AR', 'EG', 'ZA', 'KE', 'JM']
// Nhóm B: thêm các nước gần gũi và cờ dễ nhận ra.
export const GROUP_B = [
  ...GROUP_A,
  'CN', 'IT', 'AU', 'ID', 'MY', 'SG', 'PH', 'LA', 'KH', 'NO', 'FI', 'DK', 'ES', 'PT', 'NL', 'TR', 'IL', 'NP', 'BT', 'LB',
  'CU', 'CL', 'CO', 'PE', 'NG', 'GH', 'MA', 'NZ', 'UA', 'PL',
]

// Cặp cờ dễ nhầm: các vòng đầu không cho xuất hiện cùng lượt; vòng khó cố ý đặt cạnh nhau.
const LOOKALIKES: [string, string][] = [
  ['VN', 'CN'], ['GB', 'AU'], ['AU', 'NZ'], ['NO', 'IS'], ['NO', 'DK'], ['SE', 'FI'], ['DK', 'CH'],
  ['IE', 'IT'], ['IE', 'CI'], ['IT', 'MX'], ['NL', 'LU'], ['RU', 'SI'], ['RU', 'SK'], ['RS', 'RU'],
  ['ID', 'PL'], ['SG', 'ID'], ['MY', 'US'], ['BE', 'DE'], ['AT', 'LV'], ['CO', 'EC'], ['CO', 'VE'],
  ['HU', 'IT'], ['RO', 'BE'], ['SN', 'CM'], ['GH', 'ET'], ['JO', 'KW'],
  ['FR', 'NL'], ['TH', 'CR'], ['AR', 'UY'], ['PY', 'NL'], ['BO', 'GH'],
]

function clash(a: string, b: string): boolean {
  return LOOKALIKES.some(([x, y]) => (a === x && b === y) || (a === y && b === x))
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Cấu hình độ khó của một vòng. */
type Stage = { flags: 2 | 3 | 4; pool: 'A' | 'B' | 'all'; lookalikes: boolean }

// Vòng 1, 2, 3… khó dần. Từ vòng 6 trở đi giữ mức khó nhất.
const STAGES: Stage[] = [
  { flags: 2, pool: 'A', lookalikes: false },
  { flags: 3, pool: 'A', lookalikes: false },
  { flags: 3, pool: 'B', lookalikes: false },
  { flags: 3, pool: 'all', lookalikes: false },
  { flags: 4, pool: 'all', lookalikes: false },
  { flags: 4, pool: 'all', lookalikes: true },
]

export const stageOf = (round: number): Stage => STAGES[Math.min(round, STAGES.length) - 1]

/** Vòng bắt đầu theo mức chơi bé chọn: Dễ từ vòng 1, Vừa từ vòng 3, Khó từ vòng 5. */
export const START_ROUND: Record<Level, number> = { easy: 1, medium: 3, hard: 5 }

export type Question = { options: Country[]; target: Country }

/** Một câu hỏi của vòng `round`. Không lặp lại các nước đã hỏi trong vòng này (`asked`). */
export function makeQuestion(round: number, asked: string[] = []): Question {
  const stage = stageOf(round)
  const pool =
    stage.pool === 'A'
      ? COUNTRIES.filter((x) => GROUP_A.includes(x.code))
      : stage.pool === 'B'
        ? COUNTRIES.filter((x) => GROUP_B.includes(x.code))
        : COUNTRIES
  const fresh = pool.filter((x) => !asked.includes(x.code))
  const target = shuffle(fresh.length ? fresh : pool)[0]
  const options: Country[] = [target]
  if (stage.lookalikes) {
    const twins = shuffle(COUNTRIES.filter((x) => x.code !== target.code && clash(x.code, target.code)))
    if (twins.length) options.push(twins[0])
  }
  for (const x of shuffle(pool)) {
    if (options.length === stage.flags) break
    if (options.includes(x)) continue
    if (!stage.lookalikes && options.some((o) => clash(o.code, x.code))) continue
    options.push(x)
  }
  return { options: shuffle(options), target }
}

export const flagSrc = (code: string) => `/assets/flags/${code}.svg`
