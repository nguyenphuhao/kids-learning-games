// Cảnh Phaser của trò "Vào rừng tìm chữ".
//
// Thế giới cao 900 đơn vị, dài theo số bạn thú; camera phóng to cho vừa chiều cao khung chơi
// và trượt theo xe. Bé lái xe bằng cách kéo xe, hoặc chạm vào chỗ trống phía trước để xe tự chạy tới.
// Xe dừng trước mỗi bạn thú đang cầm bóng có chữ; bé chạm bạn thú thì React mở thử thách viết chữ
// (Writer). Viết xong (React gọi solve()) thì bạn thú vui mừng, nhảy sang bên đường, bóng bay lên.
// Thu đủ chữ, xe chạy qua cổng rừng: hiện bảng có hình và các ô trống, bé kéo chữ vào đúng ô.
//
// Cây, bụi, hoa, nấm, mây và xe đều chạm vào được (rung, thả táo, bướm bay, hoa xoay…).

import * as Phaser from 'phaser'
import type { Glyph, GlyphKind } from '../writing/glyphs'
import { ANIMAL_KEYS, dataUrl, glyphArt, IMAGE_KEYS, imageUrl, SVG_ART, type Art } from './art'

export type ForestItem = { char: string; kind: GlyphKind; glyph: Glyph }

export type ForestEvent =
  | { type: 'meet' }
  | { type: 'challenge'; index: number }
  | { type: 'collected'; index: number }
  | { type: 'arrive' }
  | { type: 'wrong' }
  | { type: 'complete' }

export type ForestConfig = {
  /** Các chữ theo đúng thứ tự trong từ (hoặc dãy số). */
  items: ForestItem[]
  /** Hình minh hoạ trên bảng cuối (emoji), không có thì null. */
  picture: string | null
  /** Ô trống có chữ mờ gợi ý. */
  hints: boolean
  onEvent: (e: ForestEvent) => void
}

const H = 900
const RES = 2 // texture vẽ gấp đôi kích thước trong thế giới cho nét sắc
const GROUND_Y = 560
const ROAD_TOP = 650
const ROAD_BOTTOM = 800
const CAR_Y = 770
const ANIMAL_Y = 790
const FIRST_ANIMAL_X = 1150
const ANIMAL_STEP = 1000
const STOP_GAP = 270 // xe dừng cách bạn thú chừng này
const SPEED = 520 // đơn vị / giây
const GLYPH_H = 120
const CAR_BODY_Y = -22 // chân thân xe (so với mặt đường dưới bánh)

type Animal = {
  index: number
  x: number
  body: Phaser.GameObjects.Image
  balloon: Phaser.GameObjects.Container
  solved: boolean
  met: boolean
}

type Slot = { char: string; x: number; y: number; filled: boolean; g: Phaser.GameObjects.Graphics; hint?: Phaser.GameObjects.Image }
type Tile = { char: string; c: Phaser.GameObjects.Container; homeX: number; homeY: number; placed: boolean; slot?: Slot }

const glyphKey = (it: ForestItem) => `glyph-${it.kind}-${it.glyph.id}`

export class ForestScene extends Phaser.Scene {
  private cfg!: ForestConfig
  private worldW = 0
  private gateX = 0
  private car!: Phaser.GameObjects.Container
  private wheels: Phaser.GameObjects.Image[] = []
  private carBody!: Phaser.GameObjects.Image
  private targetX = 0
  private camX = 0
  private animals: Animal[] = []
  private phase: 'drive' | 'challenge' | 'build' | 'done' = 'drive'
  private carHint?: Phaser.GameObjects.Graphics
  private meetRing?: Phaser.GameObjects.Graphics
  private slots: Slot[] = []
  private tiles: Tile[] = []
  private board?: Phaser.GameObjects.Container
  private elapsed = 0

  constructor() {
    super('forest')
  }

  init(cfg: ForestConfig) {
    this.cfg = cfg
    this.animals = []
    this.wheels = []
    this.slots = []
    this.tiles = []
    this.phase = 'drive'
    this.board = undefined
    this.carHint = undefined
    this.meetRing = undefined
  }

  preload() {
    for (const key of IMAGE_KEYS) if (!this.textures.exists(key)) this.load.image(key, imageUrl(key))
    const arts: Art[] = [...SVG_ART]
    for (const it of this.cfg.items) arts.push(glyphArt(glyphKey(it), it.glyph, it.kind, GLYPH_H))
    for (const a of arts) {
      if (!this.textures.exists(a.key)) this.load.svg(a.key, dataUrl(a), { width: a.w * RES, height: a.h * RES })
    }
  }

  private img(key: string, x: number, y: number, ox = 0.5, oy = 1) {
    return this.add.image(x, y, key).setScale(1 / RES).setOrigin(ox, oy)
  }

  create() {
    const n = this.cfg.items.length
    this.gateX = FIRST_ANIMAL_X + n * ANIMAL_STEP
    this.worldW = this.gateX + 900

    this.drawBackdrop()
    this.drawScenery()
    this.makeGate()
    this.makeAnimals()
    this.makeCar()

    // Chạm vào chỗ trống: xe chạy tới đó (trong giới hạn).
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (this.phase !== 'drive' || over.length > 0) return
      this.driveTo(p.worldX)
    })

    this.scale.on('resize', this.onResize, this)
    this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this))
    this.onResize()
    this.camX = this.car.x + this.viewW() * 0.2
    this.cameras.main.centerOn(this.camX, H / 2)
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
    if (this.phase === 'build' || this.phase === 'done') this.layoutBuild()
  }

  // ---------- Nền ----------

  private drawBackdrop() {
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-1000)
    sky.fillGradientStyle(0xbfe9fb, 0xbfe9fb, 0xe6fbff, 0xe6fbff, 1)
    sky.fillRect(-4000, -2000, 12000, 4000)

    // Tranh đồi xa (ảnh nối liền hai đầu) lặp lại, trôi chậm hơn xe cho cảm giác chiều sâu.
    const hillsH = GROUND_Y + 70
    const src = this.textures.get('hills').getSourceImage()
    const hillsW = (src.width / src.height) * hillsH
    for (let x = -hillsW; x < this.worldW * 0.35 + 4000; x += hillsW - 2) {
      this.add.image(x, GROUND_Y + 70, 'hills').setOrigin(0, 1).setDisplaySize(hillsW, hillsH).setScrollFactor(0.35, 1).setDepth(-900)
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

  private drawScenery() {
    const rnd = new Phaser.Math.RandomDataGenerator([String(this.cfg.items.map((i) => i.char).join(''))])
    // Mây trên trời.
    for (let x = 200; x < this.worldW; x += rnd.between(450, 700)) {
      const c = this.img('cloud', x, rnd.between(120, 260), 0.5, 0.5).setDepth(-950)
      c.setScale(c.scale * rnd.realInRange(0.8, 1.2))
      this.tappable(c, () => this.puff(c))
      this.tweens.add({ targets: c, x: x + 60, duration: rnd.between(6000, 9000), yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    }
    // Cây và bụi phía sau đường.
    for (let x = 150; x < this.worldW; x += rnd.between(320, 520)) {
      if (rnd.frac() < 0.6) this.makeTree(x, ROAD_TOP - 4)
      else this.makeBush(x, ROAD_TOP + 4)
    }
    // Hoa, nấm, bụi phía trước đường.
    for (let x = 100; x < this.worldW; x += rnd.between(180, 320)) {
      const y = rnd.between(ROAD_BOTTOM + 60, H - 6)
      const r = rnd.frac()
      // Hàng trước chỉ có hoa và nấm (thấp), để không che bạn thú trên đường.
      if (r < 0.6) {
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
    obj.on('pointerdown', fn)
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

  private makeGate() {
    // Cổng nằm sau xe (xe chạy qua giữa hai cột).
    this.img('gate', this.gateX, ROAD_BOTTOM + 10).setDepth(CAR_Y - 10)
  }

  // ---------- Hiệu ứng ----------

  private sparks(x: number, y: number, tint = 0xfff59d, count = 8, key = 'spark') {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4
      const d = Phaser.Math.Between(50, 110)
      const s = this.img(key, x, y, 0.5, 0.5).setDepth(5000).setTint(tint)
      if (key !== 'spark') s.clearTint()
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
      const b = this.img('butterfly', x + Phaser.Math.Between(-60, 60), y, 0.5, 0.5).setDepth(5000)
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

  // ---------- Bạn thú ----------

  private makeAnimals() {
    const order = Phaser.Utils.Array.Shuffle(this.cfg.items.map((_, i) => i))
    const kinds = Phaser.Utils.Array.Shuffle([...ANIMAL_KEYS])
    const colors = [0xff8a80, 0xffd54f, 0x81d4fa, 0xce93d8, 0xa5d6a7, 0xffab91]
    order.forEach((index, k) => {
      const x = FIRST_ANIMAL_X + k * ANIMAL_STEP
      const kind = kinds[k % kinds.length]
      const body = this.img(kind, x, ANIMAL_Y).setDepth(ANIMAL_Y)
      const letter = this.img(glyphKey(this.cfg.items[index]), 0, 0, 0.5, 0.5)
      const fit = (size: number) => letter.setScale(letter.scale * Math.min(1, size / Math.max(letter.displayWidth, letter.displayHeight)))
      let balloon: Phaser.GameObjects.Container
      if (kind === 'rabbit') {
        // Thỏ tự cầm bóng đỏ trong ảnh: đặt chữ lên quả bóng đó.
        fit(52)
        balloon = this.add.container(x + 61, ANIMAL_Y - 207, [letter]).setDepth(ANIMAL_Y + 1)
      } else {
        // Bóng bay có chữ, dây buộc ở bàn tay đang vẫy (bên phải). Dây nối dài thêm để bóng
        // nằm trên đầu bạn thú, không che mặt.
        const lift = 70
        const string = this.add.graphics().lineStyle(3, 0x90a4ae, 1).lineBetween(0, 0, 0, -lift - 4)
        const balloonImg = this.img('balloon', 0, -lift).setTint(colors[k % colors.length])
        balloonImg.setScale(balloonImg.scale * 0.8)
        letter.setY(-lift - 142)
        fit(84)
        balloon = this.add.container(x + 63, ANIMAL_Y - 148, [string, balloonImg, letter]).setDepth(ANIMAL_Y + 1)
        this.tweens.add({ targets: balloon, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
        balloonImg.setInteractive({ useHandCursor: true })
        balloonImg.on('pointerdown', () => this.tapAnimal(a))
      }
      const a: Animal = { index, x, body, balloon, solved: false, met: false }
      body.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 1 })
      body.on('pointerdown', () => this.tapAnimal(a))
      this.animals.push(a)
    })
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

  private tapAnimal(a: Animal) {
    if (a.solved) {
      this.hop(a.body)
      this.sparks(a.body.x, a.body.y - 200, 0xffffff, 5, 'heart')
      return
    }
    if (this.phase === 'drive' && a.met) {
      this.phase = 'challenge'
      this.meetRing?.destroy()
      this.meetRing = undefined
      this.cfg.onEvent({ type: 'challenge', index: a.index })
    } else {
      this.hop(a.body, 40, a.balloon)
    }
  }

  /** React gọi khi bé viết xong chữ của bạn thú đang gặp. */
  solve() {
    const a = this.animals.find((x) => x.met && !x.solved)
    if (!a) return
    a.solved = true
    this.phase = 'drive'
    this.sparks(a.body.x, a.body.y - 200, 0xffffff, 8, 'heart')
    // Bóng bay lên trời.
    this.tweens.add({ targets: a.balloon, y: -300, x: a.balloon.x + 120, duration: 1800, ease: 'Sine.in', onComplete: () => a.balloon.destroy() })
    // Bạn thú nhảy mừng rồi nhảy sang bãi cỏ bên đường.
    const sideY = ROAD_TOP - 6
    this.tweens.chain({
      targets: a.body,
      tweens: [
        { y: ANIMAL_Y - 70, duration: 200, ease: 'Quad.out', yoyo: true },
        { y: ANIMAL_Y - 70, duration: 200, ease: 'Quad.out', yoyo: true },
        {
          x: a.x + 60,
          y: sideY,
          duration: 500,
          ease: 'Quad.inOut',
          onStart: () => a.body.setDepth(sideY),
        },
      ],
    })
    this.cfg.onEvent({ type: 'collected', index: a.index })
  }

  /** React gọi khi bé đóng thử thách mà chưa viết xong. */
  cancelChallenge() {
    if (this.phase === 'challenge') this.phase = 'drive'
    const a = this.animals.find((x) => x.met && !x.solved)
    if (a) this.showMeetRing(a)
  }

  private showMeetRing(a: Animal) {
    this.meetRing?.destroy()
    const ring = this.add.graphics({ x: a.body.x, y: a.body.y - 120 }).setDepth(ANIMAL_Y - 1)
    ring.lineStyle(10, 0xffffff, 1)
    ring.strokeCircle(0, 0, 120)
    this.tweens.add({ targets: ring, scale: { from: 0.85, to: 1.15 }, alpha: { from: 1, to: 0.3 }, duration: 700, yoyo: true, repeat: -1 })
    this.meetRing = ring
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
      if (!moved) this.hop(this.carBody, 16)
    })

    // Vòng nhấp nháy quanh xe lúc đầu: gợi ý bé kéo xe.
    const hint = this.add.graphics({ x: this.car.x + 150, y: CAR_Y - 90 }).setDepth(CAR_Y + 1)
    hint.fillStyle(0xffffff, 0.9)
    hint.fillTriangle(0, -30, 0, 30, 44, 0)
    this.tweens.add({ targets: hint, x: hint.x + 40, alpha: { from: 1, to: 0.2 }, duration: 600, yoyo: true, repeat: -1 })
    this.carHint = hint
  }

  private nextAnimal(): Animal | undefined {
    return this.animals.find((a) => !a.solved)
  }

  private stopX(): number {
    const a = this.nextAnimal()
    return a ? a.x - STOP_GAP : this.gateX
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
    if (this.phase === 'drive' || this.phase === 'challenge') {
      const limit = this.stopX()
      if (this.targetX > limit) this.targetX = limit
      const dx = this.targetX - this.car.x
      const step = Math.min(Math.abs(dx), SPEED * dt)
      if (step > 0.5) {
        this.car.x += Math.sign(dx) * step
        this.wheels.forEach((w) => (w.rotation += (Math.sign(dx) * step) / 30))
        this.carBody.y = CAR_BODY_Y + Math.sin(this.elapsed * 30) * 1.5
      } else {
        this.carBody.y = CAR_BODY_Y
      }
      if (this.phase === 'drive' && Math.abs(this.car.x - limit) < 2) this.arrive()

      // Camera đi theo xe: xe ở khoảng 1/3 bên trái màn hình.
      const want = this.car.x + this.viewW() * 0.2
      this.camX += (want - this.camX) * Math.min(1, dt * 4)
      this.cameras.main.centerOn(this.camX, H / 2)
    }
  }

  private arrive() {
    const a = this.nextAnimal()
    if (a) {
      if (a.met) return
      a.met = true
      this.showMeetRing(a)
      this.tweens.add({ targets: a.body, angle: { from: -6, to: 6 }, duration: 220, yoyo: true, repeat: 3, onComplete: () => a.body.setAngle(0) })
      this.cfg.onEvent({ type: 'meet' })
    } else {
      this.startBuild()
    }
  }

  // ---------- Màn xếp chữ ----------

  private startBuild() {
    this.phase = 'build'
    this.cfg.onEvent({ type: 'arrive' })
    this.board = this.add.container(0, 0).setDepth(6000)
    const bg = this.add.graphics()
    this.board.add(bg)
    if (this.cfg.picture) {
      const pic = this.add.text(0, 0, this.cfg.picture, { fontSize: '150px', resolution: RES }).setOrigin(0.5)
      pic.setName('picture')
      this.board.add(pic)
      this.tweens.add({ targets: pic, scale: { from: 0.95, to: 1.05 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    }
    this.slots = this.cfg.items.map((it) => {
      const g = this.add.graphics().setDepth(6001)
      const slot: Slot = { char: it.char, x: 0, y: 0, filled: false, g }
      if (this.cfg.hints) slot.hint = this.img(glyphKey(it), 0, 0, 0.5, 0.5).setAlpha(0.25).setDepth(6002)
      return slot
    })
    const order = Phaser.Utils.Array.Shuffle(this.cfg.items.map((_, i) => i))
    this.tiles = order.map((i) => {
      const it = this.cfg.items[i]
      const bgT = this.add.graphics()
      const letter = this.img(glyphKey(it), 0, 0, 0.5, 0.5)
      const c = this.add.container(0, 0, [bgT, letter]).setDepth(7000)
      const tile: Tile = { char: it.char, c, homeX: 0, homeY: 0, placed: false }
      this.input.setDraggable(c.setInteractive({ hitArea: new Phaser.Geom.Rectangle(0, 0, 1, 1), hitAreaCallback: Phaser.Geom.Rectangle.Contains, draggable: true, useHandCursor: true }))
      c.on('dragstart', () => {
        c.setDepth(8000)
        this.tweens.add({ targets: c, scale: 1.12, duration: 120 })
      })
      c.on('drag', (_p: Phaser.Input.Pointer, x: number, y: number) => c.setPosition(x, y))
      c.on('dragend', () => this.dropTile(tile))
      return tile
    })
    this.layoutBuild()
    // Các chữ bay từ trên trời xuống.
    this.tiles.forEach((t, i) => {
      const y = t.c.y
      t.c.y = -200
      this.tweens.add({ targets: t.c, y, delay: 200 + i * 150, duration: 700, ease: 'Bounce.out' })
    })
  }

  /** Đặt bảng, ô trống và chữ theo khung nhìn hiện tại (gọi lại khi đổi cỡ màn hình). */
  private layoutBuild() {
    if (!this.board) return
    const vw = this.viewW()
    const cx = Phaser.Math.Clamp(this.camX, vw / 2, this.worldW - vw / 2)
    this.camX = cx
    this.cameras.main.centerOn(cx, H / 2)
    const n = this.slots.length
    const s = Math.min(150, (vw - 80) / n - 20)
    const gap = s + 20
    const hasPic = !!this.cfg.picture
    const boardW = Math.min(vw - 40, Math.max(n * gap + 60, 420))
    const boardTop = 40
    const slotY = hasPic ? 380 : 190
    const boardH = slotY + s / 2 + 40 - boardTop

    const bg = this.board.getAt(0) as Phaser.GameObjects.Graphics
    bg.clear()
    bg.fillStyle(0x000000, 0.12)
    bg.fillRoundedRect(cx - boardW / 2, boardTop + 8, boardW, boardH, 36)
    bg.fillStyle(0xfff8e1, 1)
    bg.fillRoundedRect(cx - boardW / 2, boardTop, boardW, boardH, 36)
    bg.lineStyle(8, 0x8d6e63, 1)
    bg.strokeRoundedRect(cx - boardW / 2, boardTop, boardW, boardH, 36)
    const pic = this.board.getByName('picture') as Phaser.GameObjects.Text | null
    pic?.setPosition(cx, 175)

    const glyphFit = (img: Phaser.GameObjects.Image) => {
      const k = (s * 0.72) / Math.max(img.width, img.height)
      img.setScale(k)
    }

    this.slots.forEach((slot, i) => {
      slot.x = cx + (i - (n - 1) / 2) * gap
      slot.y = slotY
      slot.g.clear()
      slot.g.fillStyle(0xffffff, 1)
      slot.g.fillRoundedRect(slot.x - s / 2, slot.y - s / 2, s, s, 22)
      slot.g.lineStyle(6, 0x90caf9, 1)
      slot.g.strokeRoundedRect(slot.x - s / 2, slot.y - s / 2, s, s, 22)
      if (slot.hint) {
        slot.hint.setPosition(slot.x, slot.y)
        glyphFit(slot.hint)
      }
    })

    const left = cx - vw / 2 + s
    const right = cx + vw / 2 - s
    this.tiles.forEach((t, i) => {
      const bgT = t.c.getAt(0) as Phaser.GameObjects.Graphics
      bgT.clear()
      bgT.fillStyle(0x000000, 0.15)
      bgT.fillRoundedRect(-s / 2, -s / 2 + 6, s, s, 22)
      bgT.fillStyle(0xffffff, 1)
      bgT.fillRoundedRect(-s / 2, -s / 2, s, s, 22)
      bgT.lineStyle(5, 0xffb74d, 1)
      bgT.strokeRoundedRect(-s / 2, -s / 2, s, s, 22)
      glyphFit(t.c.getAt(1) as Phaser.GameObjects.Image)
      const hit = t.c.input?.hitArea as Phaser.Geom.Rectangle | undefined
      hit?.setTo(-s / 2, -s / 2, s, s)
      t.homeX = n === 1 ? cx : left + ((right - left) * i) / (n - 1)
      t.homeY = ROAD_TOP + 70 + (i % 2) * 70
      if (t.placed && t.slot) t.c.setPosition(t.slot.x, t.slot.y)
      else t.c.setPosition(t.homeX, t.homeY)
    })
  }

  private dropTile(t: Tile) {
    const c = t.c
    c.setDepth(7000)
    this.tweens.add({ targets: c, scale: 1, duration: 120 })
    const s = this.slots.find((sl) => !sl.filled && Math.abs(sl.x - c.x) < 110 && Math.abs(sl.y - c.y) < 110)
    if (s && s.char === t.char) {
      s.filled = true
      t.placed = true
      t.slot = s
      c.disableInteractive()
      this.tweens.add({ targets: c, x: s.x, y: s.y, duration: 160, ease: 'Back.out' })
      s.hint?.setVisible(false)
      this.sparks(s.x, s.y, 0xfff59d, 8)
      if (this.slots.every((sl) => sl.filled)) this.complete()
      return
    }
    if (s) this.cfg.onEvent({ type: 'wrong' })
    this.tweens.add({ targets: c, x: t.homeX, y: t.homeY, duration: 350, ease: 'Back.out' })
  }

  private complete() {
    this.phase = 'done'
    this.tiles.forEach((t, i) => {
      this.tweens.add({ targets: t.c, y: t.c.y - 40, delay: 300 + i * 120, duration: 200, yoyo: true, ease: 'Quad.out' })
    })
    const cx = this.camX
    this.time.delayedCall(300 + this.tiles.length * 120, () => {
      for (let k = 0; k < 4; k++) this.time.delayedCall(k * 180, () => this.sparks(cx + Phaser.Math.Between(-300, 300), Phaser.Math.Between(150, 450), 0xffffff, 8, 'heart'))
    })
    this.cfg.onEvent({ type: 'complete' })
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
    input: { activePointers: 3 },
    scale: { mode: Phaser.Scale.NONE, width: w, height: h, zoom: 1 / dpr },
  })
  game.scene.add('forest', ForestScene, true, cfg)
  const ro = new ResizeObserver(() => {
    const [nw, nh] = size()
    if (nw !== game.scale.width || nh !== game.scale.height) game.scale.resize(nw, nh)
  })
  ro.observe(host)
  const scene = () => (game.scene.getScene('forest') as ForestScene | null) ?? null
  // Bản dev: mở game cho script kiểm thử (Playwright) đọc vị trí bạn thú, chữ.
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
