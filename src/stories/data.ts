// Nội dung 6 truyện tương tác (sáng tác riêng cho app). Mỗi truyện:
//   đoạn mở đầu (chọn một chi tiết nhỏ, ví dụ màu xe, giữ suốt truyện để vẽ)
//   → ngã rẽ (2 hướng) → mỗi hướng một lựa chọn nữa → 4 kết thúc, kết nào cũng có hậu
//   → đoạn kết chung "Hết truyện!".
// Lời đọc: public/audio/<vi|en>/story-<storyId>-<audio>.mp3 (tiếng Việt giọng Phú Hảo, tiếng Anh giọng Lila).

import type { Lang } from '../i18n/strings'

export type Text = Record<Lang, string>

export type Choice = {
  label: Text
  /** Tên hình nhỏ trên nút, do file vẽ của truyện xử lý. */
  icon: string
  next: string
  /** Lựa chọn ở đoạn mở đầu: chi tiết được giữ suốt truyện (màu xe, màu áo…). */
  flavor?: string
}

export type StoryNode = {
  audio: string
  /** Tên cảnh, do file vẽ của truyện xử lý. */
  scene: string
  text: Text
  choices?: [Choice, Choice]
  ending?: true
}

export type StoryData = {
  id: string
  title: Text
  color: string
  defaultFlavor: string
  nodes: Record<string, StoryNode>
  outro: Text
}

const node = (audio: string, vi: string, en: string, choices?: [Choice, Choice]): StoryNode => ({
  audio,
  scene: audio,
  text: { vi, en },
  ...(choices ? { choices } : { ending: true as const }),
})

const choice = (vi: string, en: string, icon: string, next: string, flavor?: string): Choice => ({
  label: { vi, en },
  icon,
  next,
  ...(flavor ? { flavor } : {}),
})

export const PARK: StoryData = {
  id: 'park',
  title: { vi: 'Ba và Henry đi công viên', en: 'Park Ride with Dad' },
  color: '#b2ebf2',
  defaultFlavor: 'red',
  nodes: {
    start: node(
      'start',
      'Sáng nay trời thật đẹp. Ba và bé Henry đi chơi công viên bằng xe điện. Bé chọn xe màu đỏ, hay xe màu xanh?',
      "It's a sunny morning. Dad and little Henry are going to the park in a tiny electric car. Which car do you pick, the red one or the blue one?",
      [choice('Xe đỏ', 'Red car', 'car-red', 'fork', 'red'), choice('Xe xanh', 'Blue car', 'car-blue', 'fork', 'blue')],
    ),
    fork: node(
      'fork',
      'Xe chạy bon bon tới ngã ba. Đi đường bên hồ nước, hay đường qua vườn hoa?',
      'Zoom, zoom! The car reaches a fork in the path. Should they drive by the lake, or through the flower garden?',
      [choice('Hồ nước', 'The lake', 'lake', 'lake'), choice('Vườn hoa', 'The garden', 'garden', 'garden')],
    ),
    lake: node(
      'lake',
      'Bên hồ, một chú vịt con đang khóc vì lạc mẹ. Ba và Henry chở vịt con đi tìm mẹ, hay hỏi bác Rùa giúp đỡ?',
      'By the lake, a little duckling is crying. It has lost its mommy! Should Dad and Henry drive the duckling around to look, or ask Grandpa Turtle for help?',
      [choice('Chở vịt con', 'Drive the duckling', 'duckling', 'end-duck'), choice('Hỏi bác Rùa', 'Ask Grandpa Turtle', 'turtle', 'end-turtle')],
    ),
    garden: node(
      'garden',
      'Trong vườn hoa, gió thổi bay chiếc mũ của Henry lên cành cây cao! Nhờ bạn Sóc leo lên lấy, hay ba nâng Henry lên thật cao?',
      "In the flower garden, the wind blows Henry's hat up into a tall tree! Should they ask the squirrel to fetch it, or should Dad lift Henry up high?",
      [choice('Nhờ bạn Sóc', 'Ask the squirrel', 'squirrel', 'end-squirrel'), choice('Ba nâng Henry', 'Dad lifts Henry', 'lift', 'end-lift')],
    ),
    'end-duck': node(
      'end-duck',
      'Xe chạy một vòng quanh hồ. Kìa, vịt mẹ ở đằng kia! Vịt con vui quá, kêu cạp cạp cảm ơn ba và Henry.',
      "They drive all around the lake. Look, there's Mommy Duck! The duckling is so happy. Quack, quack! Thank you, Dad and Henry!",
    ),
    'end-turtle': node(
      'end-turtle',
      'Bác Rùa chậm rãi chỉ đường ra đảo nhỏ giữa hồ. Cả nhà vịt đang đợi ở đó, ôm vịt con thật chặt.',
      'Grandpa Turtle slowly points to a little island in the lake. The whole duck family is waiting there, and they give the duckling a big hug.',
    ),
    'end-squirrel': node(
      'end-squirrel',
      'Bạn Sóc nhanh nhẹn leo lên cây, mang mũ xuống cho Henry. Henry tặng Sóc một hạt dẻ để cảm ơn.',
      'The quick little squirrel scurries up the tree and brings the hat back down. Henry gives the squirrel a nut to say thank you.',
    ),
    'end-lift': node(
      'end-lift',
      'Ba nâng Henry lên thật cao. Henry lấy được mũ, lại còn nhìn thấy cầu vồng trên vườn hoa nữa!',
      "Dad lifts Henry up, up, up! Henry grabs the hat, and look, there's a rainbow over the garden!",
    ),
  },
  outro: {
    vi: 'Rồi ba và Henry lái xe điện về nhà, hẹn ngày mai lại đi chơi. Hết truyện!',
    en: 'Then Dad and Henry drive home in their little car. See you tomorrow, park! The end.',
  },
}

export const WHALE: StoryData = {
  id: 'whale',
  title: { vi: 'Henry và cá voi con', en: 'Henry and the Baby Whale' },
  color: '#bbdefb',
  defaultFlavor: 'yellow',
  nodes: {
    start: node(
      'start',
      'Hôm nay ba đưa Henry đi thuyền ra biển. Henry mặc áo phao màu vàng, hay màu cam?',
      'Today Dad takes Henry out to sea on a little boat. Which life jacket should Henry wear, the yellow one or the orange one?',
      [choice('Áo vàng', 'Yellow', 'vest-yellow', 'fork', 'yellow'), choice('Áo cam', 'Orange', 'vest-orange', 'fork', 'orange')],
    ),
    fork: node(
      'fork',
      'Giữa biển xanh, một chú cá voi con đang khóc vì lạc mẹ. Thuyền nên đi về phía rạn san hô, hay về phía hòn đảo nhỏ?',
      'In the middle of the blue sea, a baby whale is crying. It has lost its mommy! Should the boat go toward the coral reef, or toward the little island?',
      [choice('Rạn san hô', 'Coral reef', 'coral', 'coral'), choice('Đảo nhỏ', 'Little island', 'island', 'island')],
    ),
    coral: node(
      'coral',
      'Ở rạn san hô có bạn cá hề và bạn rùa biển. Hỏi bạn cá hề, hay hỏi bạn rùa biển xem mẹ cá voi ở đâu?',
      'At the coral reef, there is a clownfish and a sea turtle. Should they ask the clownfish, or the sea turtle, where Mommy Whale is?',
      [choice('Hỏi cá hề', 'Ask the clownfish', 'clownfish', 'end-clownfish'), choice('Hỏi rùa biển', 'Ask the sea turtle', 'seaturtle', 'end-seaturtle')],
    ),
    island: node(
      'island',
      'Trên đảo nhỏ có một ngọn hải đăng và một bầy hải âu. Bật đèn hải đăng thật sáng, hay nhờ bầy hải âu bay đi tìm?',
      'On the little island, there is a lighthouse and a flock of seagulls. Should they turn on the big bright light, or ask the seagulls to fly and look?',
      [choice('Bật đèn', 'Turn on the light', 'lighthouse', 'end-light'), choice('Nhờ hải âu', 'Ask the seagulls', 'seagull', 'end-gulls')],
    ),
    'end-clownfish': node(
      'end-clownfish',
      'Bạn cá hề dẫn đường qua những rặng san hô đầy màu sắc. Mẹ cá voi đang đợi ở đó! Hai mẹ con phun nước vui ơi là vui.',
      'The clownfish leads the way through the colorful coral. Mommy Whale is waiting there! Mommy and baby spray water up high. Whoosh!',
    ),
    'end-seaturtle': node(
      'end-seaturtle',
      'Bạn rùa biển bơi thật nhanh, cá voi con bơi theo sau. Chẳng mấy chốc, cá voi con đã nằm bên cạnh mẹ.',
      'The sea turtle swims fast, fast, fast, with the baby whale close behind. Soon the baby whale is snuggled next to its mommy.',
    ),
    'end-light': node(
      'end-light',
      'Ngọn hải đăng sáng rực. Mẹ cá voi nhìn thấy ánh đèn và bơi tới. Cả nhà cá voi hát một bài thật vang để cảm ơn.',
      'The lighthouse shines bright, bright, bright! Mommy Whale sees the light and swims over. The whale family sings a big song to say thank you.',
    ),
    'end-gulls': node(
      'end-gulls',
      'Bầy hải âu bay vòng vòng trên trời và tìm thấy mẹ cá voi. Cá voi con vui quá, nhảy vọt lên khỏi mặt nước!',
      'The seagulls fly round and round and spot Mommy Whale. The baby whale is so happy, it jumps right out of the water!',
    ),
  },
  outro: {
    vi: 'Rồi ba và Henry chèo thuyền về bờ, vẫy tay chào các bạn biển. Hết truyện!',
    en: 'Then Dad and Henry sail back to shore, waving goodbye to their sea friends. The end.',
  },
}

export const MOON: StoryData = {
  id: 'moon',
  title: { vi: 'Chuyến tàu tìm ông Trăng', en: 'The Moon Train' },
  color: '#d1c4e9',
  defaultFlavor: 'green',
  nodes: {
    start: node(
      'start',
      'Tối nay ông Trăng trốn sau mây mãi không ra. Ba và Henry lên chuyến tàu nhỏ đi tìm ông Trăng. Henry muốn đi tàu màu xanh lá, hay tàu màu tím?',
      'Tonight the Moon is hiding behind the clouds. Dad and Henry hop on a little train to go find the Moon. Which train should they ride, the green one or the purple one?',
      [choice('Tàu xanh lá', 'Green train', 'train-green', 'fork', 'green'), choice('Tàu tím', 'Purple train', 'train-purple', 'fork', 'purple')],
    ),
    fork: node(
      'fork',
      'Tàu chạy xình xịch tới ngã rẽ. Đi đường lên núi cao, hay đường qua cánh đồng đom đóm?',
      'Choo choo! The train comes to a split in the tracks. Should it climb the tall mountain, or roll through the field of fireflies?',
      [choice('Núi cao', 'The mountain', 'mountain', 'mountain'), choice('Đồng đom đóm', 'Firefly field', 'fireflies', 'fireflies')],
    ),
    mountain: node(
      'mountain',
      'Trên đỉnh núi, gió thổi vi vu và mây bay rất gần. Thổi cho mây bay đi, hay hỏi bác Cú chỉ đường?',
      'On top of the mountain, the wind is whooshing and the clouds are very close. Should they blow the clouds away, or ask Mr. Owl for directions?',
      [choice('Thổi mây đi', 'Blow the clouds', 'blow', 'end-blow'), choice('Hỏi bác Cú', 'Ask Mr. Owl', 'owl', 'end-owl')],
    ),
    fireflies: node(
      'fireflies',
      'Cánh đồng đầy đom đóm lấp lánh. Hát cho đom đóm nghe, hay cùng đom đóm xếp thành hình ông Trăng?',
      'The field is full of twinkling fireflies. Should they sing the fireflies a song, or help the fireflies make the shape of the Moon?',
      [choice('Hát một bài', 'Sing a song', 'song', 'end-song'), choice('Xếp hình trăng', 'Make a moon', 'shape', 'end-shape')],
    ),
    'end-blow': node(
      'end-blow',
      'Ba và Henry hít một hơi thật sâu và thổi phù phù. Mây bay đi, ông Trăng tròn sáng hiện ra và mỉm cười.',
      'Dad and Henry take a big breath and blow, whoo, whoo! The clouds drift away, and the round, bright Moon peeks out and smiles.',
    ),
    'end-owl': node(
      'end-owl',
      'Bác Cú chỉ cho tàu đi vòng qua đám mây. Kìa, ông Trăng đang ngồi chờ, sáng vằng vặc giữa trời.',
      'Mr. Owl shows the train a way around the clouds. Look! There is the Moon, shining big and bright in the sky.',
    ),
    'end-song': node(
      'end-song',
      'Nghe bài hát, đom đóm bay lên cao thành một con đường sáng. Cuối con đường, ông Trăng đang ngủ gật thức dậy và tỏa sáng.',
      'The fireflies love the song! They fly up high and make a glowing path. At the end of the path, the sleepy Moon wakes up and starts to shine.',
    ),
    'end-shape': node(
      'end-shape',
      'Đom đóm xếp thành một ông Trăng tròn lấp lánh. Ông Trăng thật nhìn thấy, vui quá nên ló ra chơi cùng.',
      'The fireflies line up into a big, round, sparkly moon. The real Moon sees it, smiles, and comes out to play.',
    ),
  },
  outro: {
    vi: 'Tàu chở ba và Henry về nhà dưới ánh trăng. Henry ngáp một cái thật dài. Chúc ngủ ngon! Hết truyện!',
    en: 'The train carries Dad and Henry home under the moonlight. Henry gives a big, sleepy yawn. Good night! The end.',
  },
}

export const GARDEN: StoryData = {
  id: 'garden',
  title: { vi: 'Vườn rau của bà', en: "Grandma's Garden" },
  color: '#c8e6c9',
  defaultFlavor: 'conical',
  nodes: {
    start: node(
      'start',
      'Cuối tuần, ba đưa Henry về quê thăm bà. Henry đội nón lá, hay đội mũ rơm để ra vườn?',
      'On the weekend, Dad takes Henry to visit Grandma in the countryside. Should Henry wear a cone hat or a straw hat in the garden?',
      [choice('Nón lá', 'Cone hat', 'hat-conical', 'fork', 'conical'), choice('Mũ rơm', 'Straw hat', 'hat-straw', 'fork', 'straw')],
    ),
    fork: node(
      'fork',
      'Vườn của bà có luống rau và cây ăn trái. Henry muốn ra luống rau, hay ra chỗ cây ăn trái?',
      "Grandma's garden has vegetable beds and fruit trees. Should Henry go to the vegetables, or to the fruit trees?",
      [choice('Luống rau', 'Vegetables', 'veggies', 'veggies'), choice('Cây ăn trái', 'Fruit trees', 'fruit', 'fruit')],
    ),
    veggies: node(
      'veggies',
      'Luống rau có cà rốt màu cam và quả bí đỏ to tròn. Nhổ cà rốt, hay hái bí đỏ?',
      'The vegetable bed has orange carrots and a big round pumpkin. Should Henry pull up the carrots, or pick the pumpkin?',
      [choice('Nhổ cà rốt', 'Carrots', 'carrot', 'end-carrot'), choice('Hái bí đỏ', 'Pumpkin', 'pumpkin', 'end-pumpkin')],
    ),
    fruit: node(
      'fruit',
      'Cây xoài trĩu quả vàng, còn bụi dâu tây thì đỏ mọng. Hái xoài, hay hái dâu tây?',
      'The mango tree is full of yellow mangoes, and the strawberry bush is bright red. Should Henry pick mangoes, or strawberries?',
      [choice('Hái xoài', 'Mangoes', 'mango', 'end-mango'), choice('Hái dâu tây', 'Strawberries', 'strawberry', 'end-strawberry')],
    ),
    'end-carrot': node(
      'end-carrot',
      'Henry kéo thật mạnh, cà rốt bật lên một cái! Bà nấu canh cà rốt ngọt lịm, cả nhà ăn ngon ơi là ngon.',
      'Henry pulls hard, and pop, out comes the carrot! Grandma makes a sweet carrot soup, and everyone says, yummy!',
    ),
    'end-pumpkin': node(
      'end-pumpkin',
      'Quả bí đỏ to quá, ba và Henry phải cùng khiêng. Bà nấu chè bí đỏ, Henry ăn hết sạch một bát.',
      'The pumpkin is so big that Dad and Henry carry it together. Grandma makes sweet pumpkin pudding, and Henry eats a whole bowl.',
    ),
    'end-mango': node(
      'end-mango',
      'Ba bế Henry lên hái những quả xoài thơm nhất. Cả nhà ngồi dưới gốc cây, ăn xoài và kể chuyện.',
      'Dad lifts Henry up to pick the sweetest mangoes. The whole family sits under the tree, eating mango and telling stories.',
    ),
    'end-strawberry': node(
      'end-strawberry',
      'Henry hái đầy một giỏ dâu tây đỏ, để dành quả to nhất tặng bà. Bà cười thật tươi.',
      'Henry fills a whole basket with red strawberries, and saves the biggest one for Grandma. Grandma smiles a big smile.',
    ),
  },
  outro: {
    vi: 'Chiều về, bà ôm Henry thật chặt và hẹn tuần sau lại ra vườn. Hết truyện!',
    en: 'In the evening, Grandma gives Henry a big hug and says, come back to the garden next week! The end.',
  },
}

export const VET: StoryData = {
  id: 'vet',
  title: { vi: 'Bác sĩ thú y Henry', en: 'Doctor Henry' },
  color: '#f8bbd0',
  defaultFlavor: 'red',
  nodes: {
    start: node(
      'start',
      'Hôm nay Henry làm bác sĩ thú y, ba làm y tá. Henry chọn túi thuốc màu đỏ, hay túi màu xanh?',
      'Today Henry is an animal doctor, and Dad is the nurse. Which doctor bag should Henry carry, the red one or the blue one?',
      [choice('Túi đỏ', 'Red bag', 'bag-red', 'fork', 'red'), choice('Túi xanh', 'Blue bag', 'bag-blue', 'fork', 'blue')],
    ),
    fork: node(
      'fork',
      'Có hai bạn đang chờ khám: bạn Mèo bị đau chân, và bạn Thỏ bị sổ mũi. Khám cho bạn nào trước nhỉ?',
      'Two friends are waiting: Kitty has a sore paw, and Bunny has a runny nose. Who should Doctor Henry help first?',
      [choice('Bạn Mèo', 'Kitty', 'cat', 'cat'), choice('Bạn Thỏ', 'Bunny', 'bunny', 'bunny')],
    ),
    cat: node(
      'cat',
      'Chân bạn Mèo bị một chiếc gai nhỏ đâm vào. Nhẹ nhàng gỡ gai ra, hay dán băng hình ngôi sao?',
      "A tiny thorn is stuck in Kitty's paw. Should Doctor Henry gently pull out the thorn, or put on a star bandage?",
      [choice('Gỡ gai ra', 'Pull out the thorn', 'thorn', 'end-thorn'), choice('Dán băng sao', 'Star bandage', 'bandage', 'end-bandage')],
    ),
    bunny: node(
      'bunny',
      'Bạn Thỏ hắt xì liên tục. Cho Thỏ uống nước ấm, hay quàng cho Thỏ một chiếc khăn len?',
      'Bunny keeps sneezing, achoo! Should Doctor Henry give Bunny a warm drink, or wrap Bunny in a cozy scarf?',
      [choice('Nước ấm', 'Warm drink', 'drink', 'end-drink'), choice('Khăn len', 'Cozy scarf', 'scarf', 'end-scarf')],
    ),
    'end-thorn': node(
      'end-thorn',
      'Henry gỡ chiếc gai ra thật nhẹ nhàng. Bạn Mèo hết đau, kêu meo meo và dụi đầu vào tay Henry.',
      "Henry pulls the thorn out very gently. Kitty's paw feels better! Meow, meow, Kitty rubs against Henry's hand.",
    ),
    'end-bandage': node(
      'end-bandage',
      'Ba rửa vết thương, Henry dán băng ngôi sao. Bạn Mèo đi khoe chiếc băng đẹp với cả xóm.',
      'Dad cleans the paw, and Henry puts on a shiny star bandage. Kitty shows off the pretty bandage to all the neighbors.',
    ),
    'end-drink': node(
      'end-drink',
      'Bạn Thỏ uống cốc nước ấm, thấy ấm cả bụng. Hắt xì một cái cuối cùng, rồi Thỏ khỏe lại và nhảy tưng tưng.',
      'Bunny sips the warm drink and feels cozy inside. One last achoo, and then Bunny feels better and hops around, boing, boing!',
    ),
    'end-scarf': node(
      'end-scarf',
      'Chiếc khăn len thật ấm. Bạn Thỏ ngủ một giấc ngon lành, sáng dậy đã hết sổ mũi.',
      'The scarf is soft and warm. Bunny takes a good long nap and wakes up all better.',
    ),
  },
  outro: {
    vi: 'Bác sĩ Henry và y tá ba cất túi thuốc. Hôm nay các bạn thú đều khỏe mạnh rồi! Hết truyện!',
    en: 'Doctor Henry and Nurse Dad pack up the doctor bag. All the animal friends are healthy today! The end.',
  },
}

export const TET: StoryData = {
  id: 'tet',
  title: { vi: 'Đi chợ hoa ngày Tết', en: 'Flower Market at Tết' },
  color: '#ffccbc',
  defaultFlavor: 'red',
  nodes: {
    start: node(
      'start',
      'Tết sắp đến rồi! Ba và Henry đi chợ hoa. Henry mặc áo dài màu đỏ, hay màu vàng?',
      'The Lunar New Year is almost here! Dad and Henry go to the flower market. Should Henry wear a red ao dai, or a yellow one?',
      [choice('Áo đỏ', 'Red', 'aodai-red', 'fork', 'red'), choice('Áo vàng', 'Yellow', 'aodai-yellow', 'fork', 'yellow')],
    ),
    fork: node(
      'fork',
      'Chợ hoa đông vui quá. Mua cành mai vàng, hay cành đào hồng?',
      'The flower market is busy and fun! Should they buy yellow apricot blossoms, or pink peach blossoms?',
      [choice('Mai vàng', 'Yellow blossoms', 'mai', 'mai'), choice('Đào hồng', 'Pink blossoms', 'dao', 'dao')],
    ),
    mai: node(
      'mai',
      'Ba và Henry mang cành mai về nhà. Treo bao lì xì đỏ lên cành mai, hay treo những chiếc đèn lồng nhỏ?',
      'They bring the yellow blossoms home. Should Henry hang little red envelopes on the branches, or tiny lanterns?',
      [choice('Bao lì xì', 'Red envelopes', 'envelope', 'end-envelope'), choice('Đèn lồng', 'Lanterns', 'lantern', 'end-lantern')],
    ),
    dao: node(
      'dao',
      'Cành đào hồng đẹp quá. Ba và Henry ở nhà gói bánh chưng, hay đi xem múa lân?',
      'The pink blossoms are so pretty! Should Dad and Henry stay home to wrap sticky rice cakes, or go watch the lion dance?',
      [choice('Gói bánh chưng', 'Rice cakes', 'banhchung', 'end-banhchung'), choice('Xem múa lân', 'Lion dance', 'lion', 'end-lion')],
    ),
    'end-envelope': node(
      'end-envelope',
      'Cành mai lấp lánh bao lì xì đỏ. Henry chúc ba năm mới mạnh khỏe! Ba cười và ôm Henry thật chặt.',
      'The branches sparkle with red envelopes. Henry says, Happy New Year, Dad! Dad laughs and gives Henry a big hug.',
    ),
    'end-lantern': node(
      'end-lantern',
      'Những chiếc đèn lồng sáng lung linh trên cành mai. Cả nhà ngồi ngắm và ăn mứt Tết.',
      'The tiny lanterns glow on the yellow branches. The family sits together, admiring them and eating sweet New Year treats.',
    ),
    'end-banhchung': node(
      'end-banhchung',
      'Henry đặt từng lá dong xanh, ba buộc dây thật chặt. Chiếc bánh chưng vuông vức đã sẵn sàng đón Tết!',
      'Henry lays down the green leaves, and Dad ties the string tight. The square sticky rice cake is ready for the New Year!',
    ),
    'end-lion': node(
      'end-lion',
      'Ông lân nhảy múa theo tiếng trống tùng tùng. Henry vỗ tay thật to, ông lân còn cúi chào Henry nữa!',
      'The lion dances to the drums, boom, boom, boom! Henry claps and claps, and the lion bows to say hello!',
    ),
  },
  outro: {
    vi: 'Năm mới đến rồi, cả nhà chúc nhau thật nhiều điều tốt đẹp. Hết truyện!',
    en: 'The New Year is here, and everyone wishes each other lots of happiness. The end.',
  },
}

export const STORY_DATA: StoryData[] = [PARK, WHALE, MOON, GARDEN, VET, TET]

/** Mọi câu thoại của các truyện, để tải trước. */
export const STORY_AUDIO_KEYS: string[] = STORY_DATA.flatMap((s) => [
  ...Object.values(s.nodes).map((n) => `story-${s.id}-${n.audio}`),
  `story-${s.id}-outro`,
])

export const endingIds = (s: StoryData) => Object.keys(s.nodes).filter((id) => s.nodes[id].ending)
