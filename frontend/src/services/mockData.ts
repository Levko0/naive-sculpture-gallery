import { Sculpture } from '../types';

export const INITIAL_MOCK_SCULPTURES: Sculpture[] = [
  {
    id: "sculpt-001",
    slug: "zvir-okhoronets-sadu",
    title_ua: "Звір-Охоронець Саду",
    title_en: "Garden Guardian Beast",
    story_ua: "Створений під враженням від поліських легенд про доброзичливих духів природи. Його очі наївні й відкриті до світу, а вигнута спина увібрала тепло вечірнього сонця. Кожен вигин форми виконано пальцями без використання стека, зберігаючи живий відбиток долоні майстра. Текстура шамотної глини нагадує кору стародавнього дуба, вкритого ніжним мохом.",
    story_en: "Inspired by Ukrainian Polissya folklore of benevolent nature spirits. Its wide eyes are sincere and tender towards the world, and its arched spine absorbed the warm rays of the setting sun. Every contour was shaped purely by fingers without tools, preserving the tactile trace of the master's touch. The coarse chamotte clay texture evokes ancient oak bark kissed by gentle moss.",
    material_ua: "Шамотна глина, молочний випал, ангоби",
    material_en: "Coarse chamotte clay, milk firing, raw engobes",
    technique_ua: "Ручне ліплення, дворазовий випал при 1050°C, вощіння бджолиним воском",
    technique_en: "Hand-pinch sculpture, double firing at 1050°C, natural beeswax finish",
    year: 2024,
    edition_ua: "Єдиний екземпляр (1/1)",
    edition_en: "Unique original (1/1)",
    price_uah: 18500,
    price_eur: 420,
    price_usd: 460,
    dimensions: {
      height_cm: 34.0,
      width_cm: 22.0,
      depth_cm: 19.5,
      weight_kg: 4.8
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Звір-Охоронець Саду — фронтальний вигляд скульптури",
        alt_en: "Garden Guardian Beast — front angle view",
        is_cover: true,
        display_order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Деталь шамотної текстури та ручного ліплення",
        alt_en: "Chamotte clay texture detail and hand-sculpted relief",
        is_cover: false,
        display_order: 1
      },
      {
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Звір-Охоронець Саду в інтер'єрі галереї",
        alt_en: "Garden Guardian Beast displayed in gallery space",
        is_cover: false,
        display_order: 2
      }
    ],
    status: "AVAILABLE",
    display_order: 1,
    is_featured: true,
    created_at: "2024-04-12T10:00:00Z",
    updated_at: "2024-04-12T10:00:00Z"
  },
  {
    id: "sculpt-002",
    slug: "misiachna-kolybel-ptakhy",
    title_ua: "Птах, Що Заколисує Місяць",
    title_en: "Bird That Cradles the Moon",
    story_ua: "Поетичний наївний образ птаха, який щоночі оберігає небесне світило на своїх крилах. Форма навмисно спрощена до чистого дитячого силуету. У глині змішано білий кварцовий пісок із Карпат, що створює ледь помітне сяйво під прямим галерейним освітленням.",
    story_en: "A poetic naive character of a gentle bird watching over the crescent moon upon its wings. The silhouette is intentionally minimalist and reminiscent of childhood drawings. Blended with white Carpathian quartz sand, the surface gently catches the gallery light.",
    material_ua: "Біла теракота, прозора матова полива, оксиди заліза",
    material_en: "White terracotta, matte transparent glaze, iron oxides",
    technique_ua: "Пластова техніка, відкритий дров'яний випал, пігменти ручного розтирання",
    technique_en: "Slab-building, open wood-kiln firing, hand-ground mineral pigments",
    year: 2024,
    edition_ua: "Єдиний екземпляр (1/1)",
    edition_en: "Unique original (1/1)",
    price_uah: 24000,
    price_eur: 550,
    price_usd: 600,
    dimensions: {
      height_cm: 42.0,
      width_cm: 28.0,
      depth_cm: 16.0,
      weight_kg: 5.6
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Птах, Що Заколисує Місяць — основний план",
        alt_en: "Bird That Cradles the Moon — primary view",
        is_cover: true,
        display_order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Профіль пташиного крила та місяця",
        alt_en: "Side profile of the wing and moon crescent",
        is_cover: false,
        display_order: 1
      }
    ],
    status: "AVAILABLE",
    display_order: 2,
    is_featured: true,
    created_at: "2024-05-02T14:30:00Z",
    updated_at: "2024-05-02T14:30:00Z"
  },
  {
    id: "sculpt-003",
    slug: "divchyna-z-vesnianym-derevom",
    title_ua: "Дівчина з Весняним Деревцем",
    title_en: "Girl with a Spring Tree",
    story_ua: "Персонаж народного весняного обряду. В її руках — крихітна розквітла гілка як символ непохитної надії та відродження життя. Обличчя спокійне, майже медитативне. Ця робота експонувалася у межах кураторської виставки сучасного наїву в Києві.",
    story_en: "A figure embodying the ancient spring welcoming rite. In her hands she cradles a budding tree branch as an unshakable emblem of hope and rebirth. Her serene expression radiates quiet meditation. Previously showcased at the curated Naive Art Forum in Kyiv.",
    material_ua: "Червона подільська глина, димлення, охра",
    material_en: "Red Podillia clay, wood smoke reduction, natural ochre",
    technique_ua: "Скульптурне моделювання, задимлення сосновою тирсою",
    technique_en: "Direct modeling, pine-sawdust reduction pit firing",
    year: 2023,
    edition_ua: "Єдиний екземпляр (1/1)",
    edition_en: "Unique original (1/1)",
    price_uah: 21000,
    price_eur: 480,
    price_usd: 525,
    dimensions: {
      height_cm: 38.5,
      width_cm: 18.0,
      depth_cm: 15.0,
      weight_kg: 3.9
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Дівчина з Весняним Деревцем — скульптура у повний зріст",
        alt_en: "Girl with a Spring Tree — full frontal statue",
        is_cover: true,
        display_order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Тонкі деталі обличчя та деревця",
        alt_en: "Detail of face and miniature spring tree",
        is_cover: false,
        display_order: 1
      }
    ],
    status: "RESERVED",
    display_order: 3,
    is_featured: false,
    created_at: "2024-03-20T11:15:00Z",
    updated_at: "2024-03-20T11:15:00Z"
  },
  {
    id: "sculpt-004",
    slug: "stepovyi-lev-soniashnyk",
    title_ua: "Степовий Лев-Соняшник",
    title_en: "Steppe Sunflower Lion",
    story_ua: "Лев із гривою у формі розкритого соняшника — омаж народним розписам Марії Примаченко. Скульптура дихає сонячним оптимізмом, теплом глини та безпосередністю дитячого бачення. Поверхня покрита теракотовим ангобом із вкрапленнями польового шпату.",
    story_en: "A lion whose radiant mane forms a blossoming sunflower — a loving homage to Maria Prymachenko. The piece vibrates with sunlit optimism, raw clay warmth, and childlike candor. Coated in warm terracotta engobes with subtle feldspar flecks.",
    material_ua: "Глина напівпорцеляна, кольорові ангоби, матова емаль",
    material_en: "Semi-porcelain stoneware, colored engobes, satin enamel",
    technique_ua: "Ліплення з цільного пласта, гравіювання сграфіто, випал 1220°C",
    technique_en: "Single slab construction, sgraffito carving, high firing at 1220°C",
    year: 2023,
    edition_ua: "Єдиний екземпляр (1/1)",
    edition_en: "Unique original (1/1)",
    price_uah: 29500,
    price_eur: 670,
    price_usd: 740,
    dimensions: {
      height_cm: 29.0,
      width_cm: 35.0,
      depth_cm: 24.0,
      weight_kg: 6.2
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Степовий Лев-Соняшник — загальний вигляд",
        alt_en: "Steppe Sunflower Lion — general museum view",
        is_cover: true,
        display_order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1569074187119-c87815b476da?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Крупний план соняшникової гриви",
        alt_en: "Close up of sunflower mane details",
        is_cover: false,
        display_order: 1
      }
    ],
    status: "SOLD",
    display_order: 4,
    is_featured: false,
    created_at: "2023-11-10T09:00:00Z",
    updated_at: "2024-01-15T16:20:00Z"
  },
  {
    id: "sculpt-005",
    slug: "chervona-kolyadnytsia",
    title_ua: "Колядниця з Різдвяною Зіркою",
    title_en: "Carol Singer with Bethlehem Star",
    story_ua: "Наївна фігура колядниці в автентичній хустці з різдвяною зорею в руках. Скульптура наповнена сакральною тишею зимового вечора в українському селі. Орнаменти на кожушку видряпані вручну по сирій глині.",
    story_en: "A naive carol singer wrapped in a folk kerchief, bearing the Christmas star. The artwork captures the sacred silence of a winter evening in a Ukrainian village. The coat patterns were engraved by hand into wet clay before the first kiln firing.",
    material_ua: "Шамотна кераміка, пічна сажа, сусальне золото (акцент)",
    material_en: "Chamotte ceramic, soot patination, gold leaf accent",
    technique_ua: "Комбіноване ліплення, тонування натуральними пігментами",
    technique_en: "Combined pinch modeling, toned with natural soot and wax",
    year: 2024,
    edition_ua: "Єдиний екземпляр (1/1)",
    edition_en: "Unique original (1/1)",
    price_uah: 26000,
    price_eur: 590,
    price_usd: 650,
    dimensions: {
      height_cm: 46.0,
      width_cm: 20.0,
      depth_cm: 18.0,
      weight_kg: 5.1
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Колядниця з Різдвяною Зіркою — фасадний ракурс",
        alt_en: "Carol Singer with Bethlehem Star — facade angle",
        is_cover: true,
        display_order: 0
      }
    ],
    status: "AVAILABLE",
    display_order: 5,
    is_featured: true,
    created_at: "2024-06-01T12:00:00Z",
    updated_at: "2024-06-01T12:00:00Z"
  },
  {
    id: "sculpt-006",
    slug: "kozlyk-derevoryb",
    title_ua: "Козлик-Деревориб (Дивосвіт)",
    title_en: "Wonder-Goat with Horns of Wood",
    story_ua: "Міфічний характер із серії 'Сни старого гончаря'. Поєднання образу рогатого козлика і плавників риби виражає нерозривну єдність землі, води та фантазії. Використано традиційну опішнянську глину теплого вохристого кольору.",
    story_en: "A mythical creature from the 'Old Potter's Dreams' cycle. Merging the horned goat form with aquatic fins, representing the primal unity of earth, water, and creative fantasy. Crafted using traditional warm ochre Opishnia clay.",
    material_ua: "Опішнянська глина, теракотовий ангоб, попіл",
    material_en: "Opishnia terracotta clay, wood ash glaze",
    technique_ua: "Гончарний тулуб із доліпленими скульптурними елементами",
    technique_en: "Wheel-thrown torso with hand-modeled mythological appendages",
    year: 2023,
    edition_ua: "Єдиний екземпляр (1/1)",
    edition_en: "Unique original (1/1)",
    price_uah: 16000,
    price_eur: 365,
    price_usd: 400,
    dimensions: {
      height_cm: 28.0,
      width_cm: 26.0,
      depth_cm: 14.0,
      weight_kg: 3.4
    },
    photos: [
      {
        url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=85",
        alt_ua: "Козлик-Деревориб — ракурс три чверті",
        alt_en: "Wonder-Goat — three-quarters view",
        is_cover: true,
        display_order: 6
      }
    ],
    status: "SOLD",
    display_order: 6,
    is_featured: false,
    created_at: "2023-10-05T08:30:00Z",
    updated_at: "2023-12-01T15:00:00Z"
  }
];
