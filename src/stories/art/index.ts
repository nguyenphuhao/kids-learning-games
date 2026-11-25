import * as garden from './garden'
import * as moon from './moon'
import * as park from './park'
import * as tet from './tet'
import type { StoryArt } from './types'
import * as vet from './vet'
import * as whale from './whale'

// Mỗi file hình của truyện xuất hai component: Scene (cảnh) và Icon (hình trên nút lựa chọn).
export const STORY_ART: Record<string, StoryArt> = { park, whale, moon, garden, vet, tet }
