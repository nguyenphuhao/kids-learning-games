// Cảnh Phaser của trò "Vào rừng tìm chữ".
//
// Mỗi màn là một khúc rừng. Thế giới cao 900 đơn vị; camera phóng to cho vừa chiều cao khung chơi
// và trượt theo xe. Bé lái xe bằng cách kéo xe, hoặc chạm vào chỗ trống phía trước để xe tự chạy tới.
// Trên đường có các chặng, xe dừng trước mỗi chặng chưa xong:
//   - bạn thú cầm bóng có chữ: bé chạm bạn thú → React mở khung viết chữ đó → solveLetter();
//   - (có màn) bạn thú gặp nạn: bé chạm → viết tên công cụ → rescue() → công cụ hiện ra cứu bạn.
// Cuối đường là cổng rừng: camera canh giữa cổng, đèn lấp lánh, rồi React mở khung viết lại cả từ.
// Viết xong (passGate()) thì xe chạy qua cổng, màn hình tối dần và báo xong màn.
// Buổi trong ngày theo màn (sáng → tối): màu trời, lớp phủ màu; trời tối có trăng, sao, đom đóm, đèn xe.
//
// Cây, bụi, hoa, nấm, mây và xe đều chạm vào được (rung, thả táo, bướm bay, hoa xoay…).
// Âm thanh (tổng hợp, audio/sfx.ts): tiếng động cơ theo tốc độ xe, "boing" khi chạm bạn thú,
// "bụp" khi chạm cây cối, còi khi chạm xe, chuông khi nhận chữ / cứu bạn / qua cổng.

import * as Phaser from 'phaser'
import { Engine, sfxBoing, sfxChime, sfxHorn, sfxPop } from '../../audio/sfx'
import type { Glyph, GlyphKind } from '../writing/glyphs'
import { ANIMAL_KEYS, dataUrl, glyphArt, glyphWidth, IMAGE_KEYS, imageUrl, runFrame, SVG_ART, type Art, type Frame } from './art'
import type { Rescue, TimeOfDay } from './stages'

export type ForestItem = { char: string; kind: GlyphKind; glyph: Glyph }

export type ForestEvent =
  | { type: 'meet' }
  | { type: 'meetRescue' }
  | { type: 'challenge'; target: 'letter'; index: number }
  | { type: 'challenge'; target: 'rescue' | 'gate' }
  | { type: 'collected'; index: number }
  | { type: 'rescued' }
  | { type: 'atGate' }
  | { type: 'stageDone' }

export type ForestConfig = {
  /** Các chữ của từ (hoặc dãy số), theo đúng thứ tự. */
  items: ForestItem[]
  /** Tình huống cứu bạn thú của màn này, nếu có. */
  rescue: Rescue | null
  time: TimeOfDay
  onEvent: (e: ForestEvent) => void
}

const H = 900
const RES = 2 // ảnh vẽ gấp đôi kích thước trong thế giới cho nét sắc
const GROUND_Y = 560
const ROAD_TOP = 650
const ROAD_BOTTOM = 800
const CAR_Y = 770
const ANIMAL_Y = 790
const FIRST_STOP_X = 1150
const STOP_STEP = 1000
const STOP_GAP = 270 // xe dừng cách chặng chừng này
const SPEED = 520 // đơn vị / giây
const GLYPH_H = 120
// Đèn trên mái cổng rừng (so với tâm cổng).
const GATE_LIGHTS = [-112, 0, 112]
const GATE_LIGHT_Y = 373
const GATE_WRITE_DELAY_MS = 1500
const CAR_BODY_Y = -22 // chân thân xe (so với mặt đường dưới bánh)
const OVERLAY_DEPTH = 4000 // lớp phủ buổi trong ngày; trên nó là đèn, đom đóm, hiệu ứng

type Stop = {
  x: number
  /** Chữ (chỉ số trong items) hoặc tình huống cứu. */
  letter: number | null
  done: boolean
  met: boolean
  /** Phần bạn thú để chạm, nhảy mừng. */
  body: Phaser.GameObjects.Image
  /** Bóng bay có chữ (chặng chữ). */
  balloon?: Phaser.GameObjects.Container
}

const glyphKey = (it: ForestItem, f: Frame) => `glyph-${it.kind}-${it.glyph.id}-${f.top}_${f.bottom}`

export class ForestScene extends Phaser.Scene {
  private cfg!: ForestConfig
  private worldW = 0
  private gateX = 0
  private car!: Phaser.GameObjects.Container
  private wheels: Phaser.GameObjects.Image[] = []
  private carBody!: Phaser.GameObjects.Image
  private headlight?: Phaser.GameObjects.Graphics
  private targetX = 0
  private camX = 0
  private stops: Stop[] = []
  private phase: 'drive' | 'challenge' | 'gate' | 'leave' = 'drive'
  private carHint?: Phaser.GameObjects.Graphics
  private meetRing?: Phaser.GameObjects.Graphics
  private gate!: Phaser.GameObjects.Image
  private elapsed = 0
  private frame: Frame = { top: 0, bottom: 0 }
  /** Đồ vật của tình huống cứu (để hoạt cảnh lúc cứu). */
  private props: Record<string, Phaser.GameObjects.GameObject & { x: number; y: number }> = {}
  private engine = new Engine()
  /** Khung viết ở cổng đang mở. */
  private gateOpen = false

  constructor() {
    super('forest')
  }

  init(cfg: ForestConfig) {
    this.cfg = cfg
    this.stops = []
    this.wheels = []
    this.props = {}
    this.phase = 'drive'
    this.carHint = undefined
    this.meetRing = undefined
    this.headlight = undefined
    this.gateOpen = false
  }

  preload() {
    for (const key of IMAGE_KEYS) if (!this.textures.exists(key)) this.load.image(key, imageUrl(key))
    const arts: Art[] = [...SVG_ART]
    this.frame = runFrame(this.cfg.items)
    for (const it of this.cfg.items) arts.push(glyphArt(glyphKey(it, this.frame), it.glyph, this.frame, GLYPH_H, 'solid'))
    for (const a of arts) {
      if (!this.textures.exists(a.key)) this.load.svg(a.key, dataUrl(a), { width: a.w * RES, height: a.h * RES })
    }
  }

  private img(key: string, x: number, y: number, ox = 0.5, oy = 1) {
    return this.add.image(x, y, key).setScale(1 / RES).setOrigin(ox, oy)
  }

  private emoji(ch: string, x: number, y: number, size: number) {
    return this.add.text(x, y, ch, { fontSize: `${size}px`, resolution: RES }).setOrigin(0.5)
  }

  /**
   * Đặt cỡ cho hình chữ để mọi chữ của màn cùng tỉ lệ: cả khung chung và chữ rộng nhất đều vừa
   * ô vuông cạnh `size`. Gốc hình ở giữa khung, nên các chữ cùng đường chân chữ.
   */
  private fitGlyph(img: Phaser.GameObjects.Image, size: number) {
    const fh = this.frame.bottom - this.frame.top
    const widest = Math.max(...this.cfg.items.map((it) => glyphWidth(it.glyph)))
    const unit = Math.min(size / fh, size / widest) // đơn vị thế giới cho mỗi đơn vị nét chữ
    img.setScale((unit * fh) / (GLYPH_H * RES))
  }

  create() {
    // Chặng: mỗi chữ một bạn thú (thứ tự ngẫu nhiên), tình huống cứu (nếu có) chen vào chỗ ngẫu nhiên.
    const letters = Phaser.Utils.Array.Shuffle(this.cfg.items.map((_, i) => i)) as (number | null)[]
    if (this.cfg.rescue) letters.splice(Phaser.Math.Between(1, letters.length), 0, null)
    this.gateX = FIRST_STOP_X + letters.length * STOP_STEP
    this.worldW = this.gateX + 1400

    this.drawBackdrop()
    this.drawScenery()
    this.gate = this.img('gate', this.gateX, ROAD_BOTTOM - 30).setDepth(CAR_Y - 10)
    this.gate.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 1 })
    this.gate.on('pointerdown', () => {
      if (this.phase !== 'gate' || this.gateOpen) return
      sfxBoing()
      this.openGate()
    })
    const kinds = Phaser.Utils.Array.Shuffle(ANIMAL_KEYS.filter((k) => k !== this.cfg.rescue?.animal))
    letters.forEach((letter, k) => {
      const x = FIRST_STOP_X + k * STOP_STEP
      this.stops.push(letter === null ? this.makeRescue(x) : this.makeLetterStop(x, letter, kinds[k % kinds.length], k))
    })
    this.makeCar()
    this.drawTimeOfDay()

    // Chạm vào chỗ trống: xe chạy tới đó (trong giới hạn).
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (this.phase !== 'drive' || over.length > 0) return
      this.driveTo(p.worldX)
    })

    this.scale.on('resize', this.onResize, this)
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.onResize, this)
      this.engine.stop()
    })
    this.events.once('destroy', () => this.engine.stop())
    this.onResize()
    this.camX = this.car.x + this.viewW() * 0.2
    this.cameras.main.centerOn(this.camX, H / 2)
    this.cameras.main.fadeIn(500)
  }

  // ---------- Khung nhìn ----------

  private viewW() {
    const cam = this.cameras.main
    return cam.width / cam.zoom
  }

  private onResize() {
    const cam = this.cameras.main
    cam.setZoom(this.scale.height / H)
    cam.setBounds(0, 0, this.worldW, H)
  }

  // ---------- Nền và buổi trong ngày ----------

  private drawBackdrop() {
    const time = this.cfg.time
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-1000)
    sky.fillGradientStyle(time.skyTop, time.skyTop, time.skyBottom, time.skyBottom, 1)
    sky.fillRect(-4000, -2000, 12000, 4000)

    // Tranh đồi xa (ảnh nối liền hai đầu) lặp lại, trôi chậm hơn xe cho cảm giác chiều sâu.
    const hillsH = GROUND_Y + 70
    const src = this.textures.get('hills').getSourceImage()
    const hillsW = (src.width / src.height) * hillsH
    for (let x = -hillsW; x < this.worldW * 0.35 + 4000; x += hillsW - 2) {
      this.add
        .image(x, GROUND_Y + 70, 'hills')
        .setOrigin(0, 1)
        .setDisplaySize(hillsW, hillsH)
        .setScrollFactor(0.35, 1)
        .setDepth(-900)
        .setTint(time.hillsTint)
    }
    // Trời tối: tranh đồi có bầu trời sáng phía trên, phủ thêm một dải màu trời đêm lên phần trời.
    if (time.night) {
      const top = this.add.graphics().setScrollFactor(0).setDepth(-899)
      top.fillGradientStyle(time.skyTop, time.skyTop, time.skyBottom, time.skyBottom, 1, 1, 0, 0)
      top.fillRect(-4000, -2000, 12000, 2000 + GROUND_Y - 120)
    }

    const ground = this.add.graphics().setDepth(-700)
    // Cỏ cùng màu chân tranh đồi.
    ground.fillStyle(0x5db010, 1)
    ground.fillRect(-200, GROUND_Y + 60, this.worldW + 400, H - GROUND_Y + 200)
    ground.fillStyle(0xe9cf94, 1)
    ground.fillRect(-200, ROAD_TOP, this.worldW + 400, ROAD_BOTTOM - ROAD_TOP)
    ground.fillStyle(0xd8b978, 1)
    ground.fillRect(-200, ROAD_TOP, this.worldW + 400, 10)
    ground.fillRect(-200, ROAD_BOTTOM - 10, this.worldW + 400, 10)
    // Sỏi trên đường, chấm hoa trên cỏ.
    const dots = [0xf48fb1, 0xfff176, 0x81d4fa, 0xffffff]
    for (let x = 60; x < this.worldW; x += 90) {
      ground.fillStyle(0xcfae6c, 1)
      ground.fillEllipse(x + ((x * 13) % 50), ROAD_TOP + 30 + ((x * 7) % 100), 18, 8)
      ground.fillStyle(dots[(x / 90) % dots.length | 0], 1)
      ground.fillEllipse(x + ((x * 11) % 70), GROUND_Y + 20 + ((x * 3) % 60), 22, 9)
      ground.fillEllipse(x + ((x * 5) % 80), ROAD_BOTTOM + 30 + ((x * 17) % 60), 22, 9)
    }
  }

  /** Lớp phủ màu theo buổi; trời tối thêm trăng, sao, đom đóm. */
  private drawTimeOfDay() {
    const time = this.cfg.time
    if (time.overlayAlpha > 0) {
      const ov = this.add.graphics().setScrollFactor(0).setDepth(OVERLAY_DEPTH)
      ov.fillStyle(time.overlay, time.overlayAlpha)
      ov.fillRect(-4000, -2000, 12000, 6000)
    }
    if (!time.night) return
    const rnd = new Phaser.Math.RandomDataGenerator(['sao'])
    const sky = this.add.graphics().setScrollFactor(0.1, 1).setDepth(OVERLAY_DEPTH + 1)
    for (let i = 0; i < 70; i++) {
      sky.fillStyle(0xffffff, rnd.realInRange(0.5, 1))
      sky.fillCircle(rnd.between(-300, this.worldW * 0.1 + 3000), rnd.between(20, 190), rnd.realInRange(1.5, 3.5))
    }
    sky.fillStyle(0xfff7cc, 0.25)
    sky.fillCircle(700, 110, 70)
    sky.fillStyle(0xfff7cc, 1)
    sky.fillCircle(700, 110, 48)
    // Đom đóm bay lượn quanh đường.
    for (let i = 0; i < 40; i++) {
      const x = rnd.between(0, this.worldW)
      const y = rnd.between(ROAD_TOP - 150, H - 40)
      const f = this.add.circle(x, y, 5, 0xfff59d, 1).setDepth(OVERLAY_DEPTH + 2).setBlendMode(Phaser.BlendModes.ADD)
      this.tweens.add({ targets: f, x: x + rnd.between(-80, 80), y: y + rnd.between(-60, 60), duration: rnd.between(2500, 4500), yoyo: true, repeat: -1, ease: 'Sine.inOut' })
      this.tweens.add({ targets: f, alpha: { from: 1, to: 0.15 }, duration: rnd.between(500, 1100), yoyo: true, repeat: -1 })
    }
  }

  private drawScenery() {
    const rnd = new Phaser.Math.RandomDataGenerator([this.cfg.items.map((i) => i.char).join('')])
    // Mây trên trời (trời tối thì ít mây và mây sẫm).
    for (let x = 200; x < this.worldW; x += rnd.between(450, 700) * (this.cfg.time.night ? 2 : 1)) {
      const c = this.img('cloud', x, rnd.between(120, 260), 0.5, 0.5).setDepth(-950)
      c.setScale(c.scale * rnd.realInRange(0.8, 1.2))
      if (this.cfg.time.night) c.setTint(0x8a93c8)
      this.tappable(c, () => this.puff(c))
      this.tweens.add({ targets: c, x: x + 60, duration: rnd.between(6000, 9000), yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    }
    // Cây và bụi phía sau đường.
    for (let x = 150; x < this.worldW; x += rnd.between(320, 520)) {
      if (rnd.frac() < 0.6) this.makeTree(x, ROAD_TOP - 4)
      else this.makeBush(x, ROAD_TOP + 4)
    }
    // Hoa, nấm phía trước đường (thấp, để không che bạn thú).
    for (let x = 100; x < this.worldW; x += rnd.between(180, 320)) {
      const y = rnd.between(ROAD_BOTTOM + 60, H - 6)
      if (rnd.frac() < 0.6) {
        const f = this.img('flower', x, y).setDepth(y)
        this.tappable(f, () => this.spin(f))
      } else {
        const m = this.img('mushroom', x, y).setDepth(y)
        this.tappable(m, () => this.squash(m))
      }
    }
  }

  private tappable(obj: Phaser.GameObjects.Image, fn: () => void) {
    obj.setInteractive({ useHandCursor: true })
    obj.on('pointerdown', () => {
      sfxPop()
      fn()
    })
  }

  private makeTree(x: number, y: number) {
    const tree = this.img('tree', x, y).setDepth(y - 400)
    const apples = [
      [-100, -255],
      [-40, -330],
      [60, -275],
      [105, -210],
    ].map(([dx, dy]) => this.img('apple', x + dx, y + dy, 0.5, 0.5).setDepth(y - 399))
    let busy = false
    this.tappable(tree, () => {
      this.tweens.add({ targets: tree, angle: { from: -3, to: 3 }, duration: 90, yoyo: true, repeat: 2, onComplete: () => tree.setAngle(0) })
      const apple = apples.find((a) => a.visible && a.getData('home') === undefined)
      if (!apple || busy) return
      busy = true
      apple.setData('home', { x: apple.x, y: apple.y })
      const groundY = y + Phaser.Math.Between(20, 90)
      apple.setDepth(groundY)
      this.tweens.add({
        targets: apple,
        y: groundY - 18,
        x: apple.x + Phaser.Math.Between(-40, 40),
        duration: 700,
        ease: 'Bounce.out',
        onComplete: () => {
          busy = false
          this.sparks(apple.x, apple.y, 0xff8a80, 5)
          this.tweens.add({
            targets: apple,
            alpha: 0,
            delay: 1500,
            duration: 400,
            onComplete: () => {
              const home = apple.getData('home') as { x: number; y: number }
              apple.setPosition(home.x, home.y).setDepth(y - 399).setData('home', undefined)
              this.tweens.add({ targets: apple, alpha: 1, delay: 2500, duration: 400 })
            },
          })
        },
      })
    })
  }

  private makeBush(x: number, y: number) {
    const bush = this.img('bush', x, y).setDepth(y - 60)
    this.tappable(bush, () => {
      this.tweens.add({ targets: bush, scaleX: bush.scaleX * 1.08, scaleY: bush.scaleY * 0.92, duration: 120, yoyo: true, repeat: 1 })
      this.butterflies(x, y - 90)
    })
  }

  // ---------- Hiệu ứng ----------

  private sparks(x: number, y: number, tint = 0xfff59d, count = 8, key = 'spark') {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4
      const d = Phaser.Math.Between(50, 110)
      const s = this.img(key, x, y, 0.5, 0.5).setDepth(OVERLAY_DEPTH + 10)
      if (key === 'spark') s.setTint(tint)
      this.tweens.add({
        targets: s,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0,
        angle: 180,
        duration: 650,
        ease: 'Cubic.out',
        onComplete: () => s.destroy(),
      })
    }
  }

  private butterflies(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const b = this.img('butterfly', x + Phaser.Math.Between(-60, 60), y, 0.5, 0.5).setDepth(OVERLAY_DEPTH + 10)
      this.tweens.add({ targets: b, scaleX: { from: b.scaleX, to: b.scaleX * 0.3 }, duration: 110, yoyo: true, repeat: -1 })
      this.tweens.add({
        targets: b,
        x: b.x + Phaser.Math.Between(-220, 220),
        y: y - Phaser.Math.Between(200, 380),
        duration: Phaser.Math.Between(1600, 2400),
        ease: 'Sine.inOut',
        onComplete: () => this.tweens.add({ targets: b, alpha: 0, duration: 300, onComplete: () => b.destroy() }),
      })
    }
  }

  private spin(f: Phaser.GameObjects.Image) {
    if (this.tweens.isTweening(f)) return
    const s = f.scale
    this.tweens.add({ targets: f, scale: s * 1.3, angle: 360, duration: 500, yoyo: true, onComplete: () => f.setAngle(0).setScale(s) })
    this.sparks(f.x, f.y - 70, 0xff80ab)
  }

  private squash(m: Phaser.GameObjects.Image) {
    if (this.tweens.isTweening(m)) return
    const s = m.scale
    const y = m.y
    this.tweens.chain({
      targets: m,
      tweens: [
        { scaleX: s * 1.3, scaleY: s * 0.7, duration: 120 },
        { scaleX: s * 0.9, scaleY: s * 1.15, y: y - 60, duration: 220, ease: 'Quad.out' },
        { scaleX: s, scaleY: s, y, duration: 260, ease: 'Bounce.out' },
      ],
    })
  }

  private puff(c: Phaser.GameObjects.Image) {
    if (c.getData('puff')) return
    c.setData('puff', true)
    const s = c.scale
    this.tweens.add({ targets: c, scale: s * 1.2, duration: 160, yoyo: true, onComplete: () => c.setData('puff', false) })
    this.sparks(c.x, c.y + 30, 0x81d4fa, 6)
  }

  private hop(target: Phaser.GameObjects.GameObject & { y: number }, height = 40, carry?: { y: number }) {
    if (this.tweens.isTweening(target)) return
    const targets = carry ? [target, carry] : [target]
    const ys = targets.map((t) => t.y)
    this.tweens.add({
      targets,
      y: `-=${height}`,
      duration: 180,
      yoyo: true,
      ease: 'Quad.out',
      onComplete: () => targets.forEach((t, i) => (t.y = ys[i])),
    })
  }

  // ---------- Chặng: bạn thú cầm chữ ----------

  private makeLetterStop(x: number, letter: number, kind: string, k: number): Stop {
    const colors = [0xff8a80, 0xffd54f, 0x81d4fa, 0xce93d8, 0xa5d6a7, 0xffab91]
    const body = this.img(kind, x, ANIMAL_Y).setDepth(ANIMAL_Y)
    const glyph = this.img(glyphKey(this.cfg.items[letter], this.frame), 0, 0, 0.5, 0.5)
    let balloon: Phaser.GameObjects.Container
    const stop: Stop = { x, letter, done: false, met: false, body }
    if (kind === 'rabbit') {
      // Thỏ tự cầm bóng đỏ trong ảnh: đặt chữ lên quả bóng đó.
      this.fitGlyph(glyph, 70)
      balloon = this.add.container(x + 61, ANIMAL_Y - 207, [glyph]).setDepth(ANIMAL_Y + 1)
    } else {
      // Bóng bay có chữ, dây buộc ở bàn tay đang vẫy (bên phải). Dây nối dài thêm để bóng
      // nằm trên đầu bạn thú, không che mặt.
      const lift = 70
      const string = this.add.graphics().lineStyle(3, 0x90a4ae, 1).lineBetween(0, 0, 0, -lift - 4)
      const balloonImg = this.img('balloon', 0, -lift).setTint(colors[k % colors.length])
      balloonImg.setScale(balloonImg.scale * 0.8)
      glyph.setY(-lift - 142)
      this.fitGlyph(glyph, 115)
      balloon = this.add.container(x + 63, ANIMAL_Y - 148, [string, balloonImg, glyph]).setDepth(ANIMAL_Y + 1)
      this.tweens.add({ targets: balloon, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
      balloonImg.setInteractive({ useHandCursor: true })
      balloonImg.on('pointerdown', () => this.tapStop(stop))
    }
    stop.balloon = balloon
    body.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 1 })
    body.on('pointerdown', () => this.tapStop(stop))
    return stop
  }

  private tapStop(s: Stop) {
    sfxBoing()
    if (s.done) {
      this.hop(s.body)
      this.sparks(s.body.x, s.body.y - 200, 0xffffff, 5, 'heart')
      return
    }
    if (this.phase === 'drive' && s.met) {
      this.phase = 'challenge'
      this.meetRing?.destroy()
      this.meetRing = undefined
      this.cfg.onEvent(s.letter === null ? { type: 'challenge', target: 'rescue' } : { type: 'challenge', target: 'letter', index: s.letter })
    } else {
      this.hop(s.body, 40, s.balloon)
    }
  }

  private current(): Stop | undefined {
    return this.stops.find((s) => s.met && !s.done)
  }

  /** React gọi khi bé viết xong chữ của bạn thú đang gặp. */
  solveLetter() {
    const s = this.current()
    if (!s || s.letter === null) return
    s.done = true
    this.phase = 'drive'
    sfxChime()
    this.sparks(s.body.x, s.body.y - 200, 0xffffff, 8, 'heart')
    // Bóng bay lên trời.
    if (s.balloon) this.tweens.add({ targets: s.balloon, y: -300, x: s.balloon.x + 120, duration: 1800, ease: 'Sine.in', onComplete: () => s.balloon?.destroy() })
    this.happyAside(s.body, s.x)
    this.cfg.onEvent({ type: 'collected', index: s.letter })
  }

  /** Bạn thú nhảy mừng rồi nhảy sang bãi cỏ bên đường cho xe đi qua. */
  private happyAside(body: Phaser.GameObjects.Image, x: number) {
    const sideY = ROAD_TOP - 6
    const y0 = body.y
    this.tweens.chain({
      targets: body,
      tweens: [
        { y: y0 - 70, duration: 200, ease: 'Quad.out', yoyo: true },
        { y: y0 - 70, duration: 200, ease: 'Quad.out', yoyo: true },
        { x: x + 60, y: sideY, duration: 500, ease: 'Quad.inOut', onStart: () => body.setDepth(sideY) },
      ],
    })
  }

  /** React gọi khi bé đóng khung viết mà chưa viết xong. */
  cancelChallenge() {
    this.gateOpen = false
    if (this.phase === 'challenge') this.phase = 'drive'
    const s = this.current()
    if (s) this.showMeetRing(s)
  }

  private showMeetRing(s: Stop) {
    this.meetRing?.destroy()
    const ring = this.add.graphics({ x: s.body.x, y: s.body.y - 120 }).setDepth(ANIMAL_Y - 1)
    ring.lineStyle(10, 0xffffff, 1)
    ring.strokeCircle(0, 0, 120)
    this.tweens.add({ targets: ring, scale: { from: 0.85, to: 1.15 }, alpha: { from: 1, to: 0.3 }, duration: 700, yoyo: true, repeat: -1 })
    this.meetRing = ring
  }

  // ---------- Chặng: bạn thú gặp nạn ----------

  private makeRescue(x: number): Stop {
    const r = this.cfg.rescue!
    let body: Phaser.GameObjects.Image
    const tap: Phaser.GameObjects.GameObject[] = []
    switch (r.kind) {
      case 'tree': {
        // Mèo kẹt trên ngọn cây bên đường.
        const tree = this.img('tree', x + 40, ROAD_TOP + 40).setDepth(ROAD_TOP - 300)
        body = this.img(r.animal, x + 40, ROAD_TOP + 40 - 300).setDepth(ROAD_TOP - 299)
        body.setScale(body.scale * 0.7)
        this.tweens.add({ targets: body, angle: { from: -5, to: 5 }, duration: 260, yoyo: true, repeat: -1 })
        tap.push(tree)
        break
      }
      case 'hole': {
        // Thỏ rơi xuống hố giữa đường: chỉ thấy nửa trên, vành hố che phía dưới.
        // Miệng hố (phía sau thỏ), thỏ, rồi nửa trước của hố và mặt đường che phần dưới của thỏ.
        const cy = ANIMAL_Y - 20
        const g = this.add.graphics().setDepth(ANIMAL_Y - 30)
        g.fillStyle(0x5d4037, 1).fillEllipse(x, cy, 240, 76)
        g.fillStyle(0x3e2723, 1).fillEllipse(x, cy, 210, 58)
        body = this.img(r.animal, x, ANIMAL_Y + 110).setDepth(ANIMAL_Y - 25)
        const lower = (rx: number, ry: number) =>
          Array.from({ length: 25 }, (_, i) => {
            const a = (Math.PI * i) / 24
            return new Phaser.Math.Vector2(x + rx * Math.cos(a), cy + ry * Math.sin(a))
          })
        const lip = this.add.graphics().setDepth(ANIMAL_Y - 20)
        lip.fillStyle(0xe9cf94, 1).fillRect(x - 130, cy, 260, ROAD_BOTTOM - 10 - cy)
        lip.fillStyle(0x5d4037, 1).fillPoints(lower(120, 38), true)
        lip.fillStyle(0x3e2723, 1).fillPoints(lower(105, 29), true)
        this.props.hole = g
        this.props.lip = lip
        this.tweens.add({ targets: body, y: body.y - 12, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
        break
      }
      case 'fire': {
        // Đống lửa trại cháy to, bạn gấu sợ hãi đứng sau.
        body = this.img(r.animal, x + 150, ANIMAL_Y).setDepth(ANIMAL_Y)
        const fires = [-60, 0, 60].map((dx, i) => {
          const f = this.emoji('🔥', x + dx, ANIMAL_Y - 70 - (i === 1 ? 30 : 0), i === 1 ? 150 : 110).setDepth(ANIMAL_Y + 2)
          this.tweens.add({ targets: f, scaleY: { from: 0.9, to: 1.12 }, scaleX: { from: 1.05, to: 0.95 }, duration: 220 + i * 40, yoyo: true, repeat: -1 })
          tap.push(f.setInteractive({ useHandCursor: true }))
          return f
        })
        this.props.fires = this.add.container(0, 0, fires).setDepth(ANIMAL_Y + 2)
        this.tweens.add({ targets: body, x: body.x + 6, duration: 60, yoyo: true, repeat: -1 })
        break
      }
      case 'log': {
        // Khúc gỗ to đổ chắn ngang đường, bạn cáo đứng phía sau không qua được.
        body = this.img(r.animal, x + 170, ANIMAL_Y - 10).setDepth(ANIMAL_Y - 10)
        const log = this.add.container(x, ANIMAL_Y - 40).setDepth(ANIMAL_Y + 2)
        const halves = [-1, 1].map((side) => {
          const g = this.add.graphics()
          g.fillStyle(0x8d5a3b, 1).fillRoundedRect(side < 0 ? -150 : 0, -38, 150, 76, side < 0 ? { tl: 30, bl: 30, tr: 0, br: 0 } : { tl: 0, bl: 0, tr: 30, br: 30 })
          g.fillStyle(0x6d4428, 1).fillRect(side < 0 ? -130 : 20, -10, 110, 6).fillRect(side < 0 ? -110 : 40, 12, 80, 5)
          g.fillStyle(0xe6b980, 1).fillEllipse(side * 150, 0, 40, 76)
          g.lineStyle(4, 0xb7834f, 1).strokeEllipse(side * 150, 0, 24, 46)
          return g
        })
        log.add(halves)
        log.setSize(300, 80)
        log.setInteractive({ hitArea: new Phaser.Geom.Rectangle(-150, -40, 300, 80), hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true })
        tap.push(log)
        this.props.log = log
        break
      }
      case 'dark': {
        // Gấu trúc lạc giữa đường tối, dấu hỏi trên đầu.
        body = this.img(r.animal, x, ANIMAL_Y).setDepth(ANIMAL_Y)
        const q = this.emoji('❓', x + 80, ANIMAL_Y - 300, 80).setDepth(OVERLAY_DEPTH + 3)
        this.tweens.add({ targets: q, y: q.y - 16, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
        this.props.q = q
        break
      }
    }
    // Vùng chạm rộng quanh chỗ gặp nạn (hố, đống lửa, khúc gỗ…) cho bé dễ chạm trúng.
    const zone = this.add.zone(body.x, ANIMAL_Y - 150, 340, 320).setDepth(ANIMAL_Y - 40)
    zone.setInteractive({ useHandCursor: true })
    tap.push(zone)
    const stop: Stop = { x, letter: null, done: false, met: false, body }
    body.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 1 })
    for (const o of [body, ...tap]) o.on('pointerdown', () => this.tapStop(stop))
    return stop
  }

  /** React gọi khi bé viết xong tên công cụ: công cụ hiện ra và cứu bạn thú. */
  rescue() {
    const s = this.current()
    const r = this.cfg.rescue
    if (!s || s.letter !== null || !r) return
    const tool = this.emoji(r.emoji, s.x, -150, 170).setDepth(OVERLAY_DEPTH + 5)
    const done = () => {
      s.done = true
      this.phase = 'drive'
      sfxChime()
      this.sparks(s.body.x, s.body.y - 200, 0xffffff, 10, 'heart')
      this.tweens.add({ targets: tool, alpha: 0, delay: 600, duration: 400, onComplete: () => tool.destroy() })
      this.cfg.onEvent({ type: 'rescued' })
    }
    switch (r.kind) {
      case 'tree': {
        // Thang dựng vào cây, mèo trèo xuống đất rồi ra bên đường.
        this.tweens.chain({
          targets: tool,
          tweens: [
            { x: s.x + 40, y: ROAD_TOP - 120, angle: -12, duration: 600, ease: 'Back.out' },
            { scale: 1.05, duration: 200, yoyo: true },
          ],
          onComplete: () => {
            this.tweens.killTweensOf(s.body)
            s.body.setAngle(0).setDepth(ANIMAL_Y)
            this.tweens.add({
              targets: s.body,
              y: ANIMAL_Y,
              x: s.x - 20,
              scale: 1 / RES,
              duration: 900,
              ease: 'Sine.inOut',
              onComplete: () => {
                done()
                this.happyAside(s.body, s.x)
              },
            })
          },
        })
        break
      }
      case 'hole': {
        // Sợi dây thả xuống hố, kéo thỏ lên, hố được lấp.
        this.tweens.add({
          targets: tool,
          x: s.x,
          y: ANIMAL_Y - 260,
          duration: 600,
          ease: 'Back.out',
          onComplete: () => {
            this.tweens.killTweensOf(s.body)
            this.tweens.add({
              targets: s.body,
              y: ANIMAL_Y - 170,
              duration: 600,
              ease: 'Quad.out',
              onComplete: () => {
                s.body.setDepth(ANIMAL_Y)
                this.props.lip.destroy()
                this.tweens.add({ targets: this.props.hole, alpha: 0, duration: 500 })
                this.tweens.add({
                  targets: s.body,
                  y: ANIMAL_Y,
                  duration: 400,
                  ease: 'Bounce.out',
                  onComplete: () => {
                    done()
                    this.happyAside(s.body, s.x)
                  },
                })
              },
            })
          },
        })
        break
      }
      case 'fire': {
        // Xô nước nghiêng đổ, giọt nước rơi, lửa tắt.
        this.tweens.chain({
          targets: tool,
          tweens: [
            { x: s.x - 40, y: ANIMAL_Y - 330, duration: 500, ease: 'Back.out' },
            { angle: 70, duration: 300 },
          ],
          onComplete: () => {
            for (let i = 0; i < 18; i++) {
              const d = this.add.circle(s.x + Phaser.Math.Between(-90, 90), ANIMAL_Y - 300, 9, 0x4fc3f7, 1).setDepth(OVERLAY_DEPTH + 4)
              this.tweens.add({ targets: d, y: ANIMAL_Y - 40, delay: i * 40, duration: 500, ease: 'Quad.in', onComplete: () => d.destroy() })
            }
            const fires = this.props.fires as Phaser.GameObjects.Container
            this.tweens.add({ targets: fires.list, scale: 0, alpha: 0, delay: 500, duration: 500 })
            this.time.delayedCall(1100, () => {
              this.sparks(s.x, ANIMAL_Y - 80, 0xcfd8dc, 10)
              this.tweens.killTweensOf(s.body)
              done()
              this.happyAside(s.body, s.x + 90)
            })
          },
        })
        break
      }
      case 'log': {
        // Cưa kéo qua lại trên khúc gỗ, gỗ tách đôi lăn sang hai bên đường.
        this.tweens.chain({
          targets: tool,
          tweens: [
            { x: s.x, y: ANIMAL_Y - 140, duration: 500, ease: 'Back.out' },
            { x: s.x + 40, duration: 150, yoyo: true, repeat: 3 },
          ],
          onComplete: () => {
            const log = this.props.log as Phaser.GameObjects.Container
            log.disableInteractive()
            const [left, right] = log.list as Phaser.GameObjects.Graphics[]
            this.tweens.add({ targets: left, x: -220, y: -150, angle: -20, alpha: 0, duration: 800, ease: 'Quad.in' })
            this.tweens.add({ targets: right, x: 220, y: 150, angle: 20, alpha: 0, duration: 800, ease: 'Quad.in' })
            this.time.delayedCall(800, () => {
              done()
              this.happyAside(s.body, s.x + 110)
            })
          },
        })
        break
      }
      case 'dark': {
        // Đèn bật sáng, quầng sáng toả ra, gấu trúc hết lạc.
        this.tweens.add({
          targets: tool,
          x: s.x - 120,
          y: ANIMAL_Y - 200,
          duration: 500,
          ease: 'Back.out',
          onComplete: () => {
            const glow = this.add.circle(s.x - 40, ANIMAL_Y - 160, 40, 0xfff3b0, 0.5).setDepth(OVERLAY_DEPTH + 1).setBlendMode(Phaser.BlendModes.ADD)
            this.tweens.add({ targets: glow, radius: 260, scale: 5, alpha: 0.35, duration: 700 })
            this.props.q.destroy()
            this.time.delayedCall(700, () => {
              done()
              this.happyAside(s.body, s.x)
            })
          },
        })
        break
      }
    }
  }

  // ---------- Xe ----------

  private makeCar() {
    // Xe trong ảnh không có bánh (hốc bánh trống); bánh là ảnh riêng để quay khi chạy.
    this.carBody = this.img('car', 0, CAR_BODY_Y)
    this.wheels = [-84, 75].map((dx) => this.img('wheel', dx, -37, 0.5, 0.5).setScale(0.5 * 0.98))
    this.car = this.add.container(240, CAR_Y, [this.carBody, ...this.wheels]).setDepth(CAR_Y)
    // Container không đặt kích thước nên vùng chạm tính theo toạ độ quanh gốc xe (giữa, sát đất).
    this.car.setInteractive({ hitArea: new Phaser.Geom.Rectangle(-160, -215, 320, 215), hitAreaCallback: Phaser.Geom.Rectangle.Contains, draggable: true, useHandCursor: true })
    this.targetX = this.car.x
    let moved = false
    this.car.on('dragstart', () => (moved = false))
    this.car.on('drag', (_p: Phaser.Input.Pointer, dragX: number) => {
      if (this.phase !== 'drive') return
      moved = true
      this.driveTo(dragX)
    })
    this.car.on('dragend', () => {
      if (moved) return
      sfxHorn()
      this.hop(this.carBody, 16)
    })

    // Trời tối: đèn pha chiếu về phía trước (vẽ trên lớp phủ tối).
    if (this.cfg.time.night) {
      const hl = this.add.graphics().setDepth(OVERLAY_DEPTH + 1).setBlendMode(Phaser.BlendModes.ADD)
      hl.fillStyle(0xfff2a8, 0.28)
      hl.fillTriangle(150, -95, 620, -230, 620, 20)
      hl.fillStyle(0xfff2a8, 0.5)
      hl.fillCircle(150, -95, 14)
      this.headlight = hl
    }

    // Mũi tên nhấp nháy lúc đầu: gợi ý bé kéo xe.
    const hint = this.add.graphics({ x: this.car.x + 170, y: CAR_Y - 90 }).setDepth(OVERLAY_DEPTH + 3)
    hint.fillStyle(0xffffff, 0.9)
    hint.fillTriangle(0, -30, 0, 30, 44, 0)
    this.tweens.add({ targets: hint, x: hint.x + 40, alpha: { from: 1, to: 0.2 }, duration: 600, yoyo: true, repeat: -1 })
    this.carHint = hint
  }

  private nextStop(): Stop | undefined {
    return this.stops.find((s) => !s.done)
  }

  private stopX(): number {
    if (this.phase === 'leave') return this.worldW
    const s = this.nextStop()
    return s ? s.x - STOP_GAP : this.gateX
  }

  private driveTo(x: number) {
    this.targetX = Phaser.Math.Clamp(x, 200, this.stopX())
    if (this.carHint && Math.abs(this.targetX - this.car.x) > 20) {
      this.carHint.destroy()
      this.carHint = undefined
    }
  }

  update(_t: number, dtMs: number) {
    const dt = Math.min(dtMs, 50) / 1000
    this.elapsed += dt
    if (this.phase === 'gate') {
      this.engine.setSpeed(0)
      return
    }
    const limit = this.stopX()
    if (this.targetX > limit) this.targetX = limit
    const dx = this.targetX - this.car.x
    const step = Math.min(Math.abs(dx), SPEED * dt)
    if (step > 0.5) {
      this.car.x += Math.sign(dx) * step
      this.wheels.forEach((w) => (w.rotation += (Math.sign(dx) * step) / 30))
      this.carBody.y = CAR_BODY_Y + Math.sin(this.elapsed * 30) * 1.5
      this.engine.setSpeed(Math.min(1, step / (SPEED * dt)))
    } else {
      this.carBody.y = CAR_BODY_Y
      this.engine.setSpeed(0)
    }
    this.headlight?.setPosition(this.car.x, CAR_Y)
    if (this.phase === 'drive' && Math.abs(this.car.x - limit) < 2) this.arrive()

    // Camera đi theo xe: xe ở khoảng 1/3 bên trái màn hình.
    const want = this.car.x + this.viewW() * 0.2
    this.camX += (want - this.camX) * Math.min(1, dt * 4)
    this.cameras.main.centerOn(this.camX, H / 2)
  }

  private arrive() {
    const s = this.nextStop()
    if (s) {
      if (s.met) return
      s.met = true
      this.showMeetRing(s)
      if (s.letter !== null) this.tweens.add({ targets: s.body, angle: { from: -6, to: 6 }, duration: 220, yoyo: true, repeat: 3, onComplete: () => s.body.setAngle(0) })
      this.cfg.onEvent({ type: s.letter === null ? 'meetRescue' : 'meet' })
    } else {
      this.atGate()
    }
  }

  // ---------- Cổng rừng ----------

  /** Tới cổng: camera canh giữa cổng, đèn lấp lánh, rồi mở khung viết lại cả từ. */
  private atGate() {
    this.phase = 'gate'
    this.cfg.onEvent({ type: 'atGate' })
    const vw = this.viewW()
    this.tweens.addCounter({
      from: this.camX,
      to: Phaser.Math.Clamp(this.gateX, vw / 2, this.worldW - vw / 2),
      duration: 800,
      ease: 'Sine.inOut',
      onUpdate: (tw) => {
        this.camX = tw.getValue() ?? this.camX
        this.cameras.main.centerOn(this.camX, H / 2)
      },
    })
    GATE_LIGHTS.forEach((dx, i) => this.time.delayedCall(250 + i * 250, () => this.sparks(this.gateX + dx, GATE_LIGHT_Y, 0xfff59d, 8)))
    this.time.delayedCall(GATE_WRITE_DELAY_MS, () => this.openGate())
  }

  private openGate() {
    this.gateOpen = true
    this.cfg.onEvent({ type: 'challenge', target: 'gate' })
  }

  /** React gọi khi bé viết xong cả từ ở cổng: xe chạy qua cổng, màn hình tối dần, xong màn. */
  passGate() {
    if (this.phase !== 'gate') return
    sfxChime()
    GATE_LIGHTS.forEach((dx) => this.sparks(this.gateX + dx, GATE_LIGHT_Y, 0xfff59d, 10))
    this.phase = 'leave'
    this.targetX = this.gateX + 900
    this.time.delayedCall(1400, () => {
      this.cameras.main.fadeOut(500)
      this.cameras.main.once('camerafadeoutcomplete', () => this.cfg.onEvent({ type: 'stageDone' }))
    })
  }
}

export type ForestGameHandle = {
  scene: () => ForestScene | null
  restart: (cfg: ForestConfig) => void
  destroy: () => void
}

/**
 * Tạo game Phaser trong `host`. Canvas vẽ theo độ phân giải thật của màn hình (tối đa 2x) cho nét sắc,
 * và đổi cỡ theo khung chứa.
 */
export function createForestGame(host: HTMLElement, cfg: ForestConfig): ForestGameHandle {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const size = () => [Math.max(1, host.clientWidth) * dpr, Math.max(1, host.clientHeight) * dpr] as const
  const [w, h] = size()
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    backgroundColor: '#bfe9fb',
    banner: false,
    audio: { noAudio: true },
    // Không nhận chạm ngoài canvas: khung viết chữ (React) nằm đè lên cảnh, nét viết không được tính là chạm vào cảnh.
    input: { activePointers: 3, windowEvents: false },
    scale: { mode: Phaser.Scale.NONE, width: w, height: h, zoom: 1 / dpr },
  })
  game.scene.add('forest', ForestScene, true, cfg)
  const ro = new ResizeObserver(() => {
    const [nw, nh] = size()
    if (nw !== game.scale.width || nh !== game.scale.height) game.scale.resize(nw, nh)
  })
  ro.observe(host)
  const scene = () => (game.scene.getScene('forest') as ForestScene | null) ?? null
  // Bản dev: mở game cho script kiểm thử (Playwright) đọc vị trí xe, chặng.
  if (import.meta.env.DEV) (window as unknown as { __forest?: unknown }).__forest = { game, scene }
  return {
    scene,
    restart: (next) => scene()?.scene.restart(next),
    destroy: () => {
      ro.disconnect()
      game.destroy(true)
    },
  }
}
