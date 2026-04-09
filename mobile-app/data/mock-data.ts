import type { AppSeries, AppStory } from "@/types/content";

function makeStory(input: {
  id: string;
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  hskLevel: AppStory["hskLevel"];
  type: AppStory["type"];
  sections: AppStory["sections"];
  authorName?: string | null;
  isSeeded?: boolean;
  isPublic?: boolean;
  seriesGroupSlug?: string | null;
  seriesEpisode?: number | null;
  createdAt?: string;
}): AppStory {
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    titleTranslation: input.titleTranslation,
    summary: input.summary,
    excerpt: input.sections[0]?.hanzi ?? "",
    hskLevel: input.hskLevel,
    type: input.type,
    sections: input.sections,
    createdAt: input.createdAt ?? "2026-04-02T00:00:00.000Z",
    updatedAt: input.createdAt ?? "2026-04-02T00:00:00.000Z",
    authorName: input.authorName ?? null,
    authorUserId: input.authorName ? "community-1" : null,
    authorImage: null,
    isSeeded: input.isSeeded ?? true,
    isPublic: input.isPublic ?? true,
    seriesGroupSlug: input.seriesGroupSlug ?? null,
    seriesEpisode: input.seriesEpisode ?? null,
  };
}

const morningMarket = makeStory({
  id: "seed-morning-market",
  slug: "morning-market",
  title: "早上的菜市场",
  titleTranslation: "Passing Through the Morning Market",
  summary:
    "Lin walks through a neighborhood market before breakfast and notices how the city wakes up around her.",
  hskLevel: "1",
  type: "story",
  seriesGroupSlug: "city-routines",
  seriesEpisode: 1,
  sections: [
    {
      hanzi: "林娜早上七点去菜市场。市场里很热闹，很多人都在买菜。",
      pinyin:
        "Lin Na zao shang qi dian qu cai shi chang. Shi chang li hen re nao, hen duo ren dou zai mai cai.",
      english:
        "At seven in the morning, Lin Na goes to the produce market. It is lively, and many people are buying vegetables.",
    },
    {
      hanzi: "一个老爷爷在卖橘子，一个阿姨在卖豆腐。",
      pinyin: "Yi ge lao ye ye zai mai ju zi, yi ge a yi zai mai dou fu.",
      english: "A grandfather is selling tangerines, and an auntie is selling tofu.",
    },
    {
      hanzi: "林娜买了西红柿、鸡蛋和一点青菜。她觉得这样的早晨很舒服。",
      pinyin:
        "Lin Na mai le xi hong shi, ji dan he yi dian qing cai. Ta jue de zhe yang de zao chen hen shu fu.",
      english:
        "Lin Na buys tomatoes, eggs, and some greens. She feels mornings like this are comforting.",
    },
  ],
});

const subwayRide = makeStory({
  id: "seed-subway-ride",
  slug: "subway-ride",
  title: "地铁上的十分钟",
  titleTranslation: "Ten Minutes on the Subway",
  summary:
    "A short commute turns into a quiet observation exercise about how people move through the city.",
  hskLevel: "2",
  type: "story",
  seriesGroupSlug: "city-routines",
  seriesEpisode: 2,
  sections: [
    {
      hanzi: "早上八点，车站里已经有很多人。大家都走得很快。",
      pinyin: "Zao shang ba dian, che zhan li yi jing you hen duo ren. Da jia dou zou de hen kuai.",
      english: "At eight in the morning, the station is already full. Everyone is walking quickly.",
    },
    {
      hanzi: "我上了地铁以后，看见有人看书，有人听音乐，还有人闭着眼睛休息。",
      pinyin:
        "Wo shang le di tie yi hou, kan jian you ren kan shu, you ren ting yin yue, hai you ren bi zhe yan jing xiu xi.",
      english:
        "After I get on the subway, I see some people reading, some listening to music, and some resting with their eyes closed.",
    },
    {
      hanzi: "这十分钟很短，可是我觉得城市的节奏都在这里。",
      pinyin: "Zhe shi fen zhong hen duan, ke shi wo jue de cheng shi de jie zou dou zai zhe li.",
      english: "These ten minutes are short, but I feel the rhythm of the city is all here.",
    },
  ],
});

const coffeeChat = makeStory({
  id: "seed-coffee-chat",
  slug: "coffee-chat",
  title: "下班后的咖啡",
  titleTranslation: "Coffee After Work",
  summary:
    "Two friends meet after work and decide how to spend a gentle evening.",
  hskLevel: "2",
  type: "dialogue",
  seriesGroupSlug: "city-routines",
  seriesEpisode: 3,
  sections: [
    {
      hanzi: "安娜说：你今天累不累？小王说：有一点，不过我还是想出去走走。",
      pinyin:
        "An Na shuo: ni jin tian lei bu lei? Xiao Wang shuo: you yi dian, bu guo wo hai shi xiang chu qu zou zou.",
      english:
        "Anna says: Are you tired today? Xiao Wang says: A little, but I still want to go out for a walk.",
    },
    {
      hanzi: "安娜说：那我们先喝咖啡，再去河边散步吧。",
      pinyin: "An Na shuo: na wo men xian he ka fei, zai qu he bian san bu ba.",
      english: "Anna says: Then let's have coffee first and walk by the river after.",
    },
    {
      hanzi: "小王点点头，说这个主意很好。",
      pinyin: "Xiao Wang dian dian tou, shuo zhe ge zhu yi hen hao.",
      english: "Xiao Wang nods and says it is a great idea.",
    },
  ],
});

const parkLunch = makeStory({
  id: "seed-park-lunch",
  slug: "park-lunch",
  title: "公园里的午饭",
  titleTranslation: "Lunch in the Park",
  summary:
    "A simple lunch break becomes a quiet observation of spring in the city.",
  hskLevel: "1",
  type: "story",
  seriesGroupSlug: "slow-living-notes",
  seriesEpisode: 1,
  sections: [
    {
      hanzi: "今天中午天气很好，我带着午饭去公园。",
      pinyin: "Jin tian zhong wu tian qi hen hao, wo dai zhe wu fan qu gong yuan.",
      english: "The weather is nice today, so I take my lunch to the park.",
    },
    {
      hanzi: "树下有很多人，有的人看书，有的人聊天。",
      pinyin: "Shu xia you hen duo ren, you de ren kan shu, you de ren liao tian.",
      english: "There are many people under the trees. Some are reading, and some are chatting.",
    },
    {
      hanzi: "我慢慢吃饭，也慢慢看风景。",
      pinyin: "Wo man man chi fan, ye man man kan feng jing.",
      english: "I eat slowly and take in the view slowly too.",
    },
  ],
});

const rainyNotes = makeStory({
  id: "seed-rainy-notes",
  slug: "rainy-notes",
  title: "下雨天的日记",
  titleTranslation: "A Rainy Afternoon Journal",
  summary:
    "A reflective diary entry about staying indoors, making tea, and slowing the day down.",
  hskLevel: "3",
  type: "journal",
  seriesGroupSlug: "slow-living-notes",
  seriesEpisode: 2,
  sections: [
    {
      hanzi: "今天下午一直下雨，所以我没有出去跑步。",
      pinyin: "Jin tian xia wu yi zhi xia yu, suo yi wo mei you chu qu pao bu.",
      english: "It kept raining this afternoon, so I did not go out for a run.",
    },
    {
      hanzi: "我坐在窗边，泡了一杯茶，打开一本很久没有看的书。",
      pinyin: "Wo zuo zai chuang bian, pao le yi bei cha, da kai yi ben hen jiu mei you kan de shu.",
      english: "I sat by the window, made tea, and opened a book I had not read in a long time.",
    },
    {
      hanzi: "慢一点的时候，我反而更容易看见自己真正想做什么。",
      pinyin: "Man yi dian de shi hou, wo fan er geng rong yi kan jian zi ji zhen zheng xiang zuo shen me.",
      english: "When life slows down, I can more easily notice what I really want to do.",
    },
  ],
});

const weekendBookshelf = makeStory({
  id: "seed-weekend-bookshelf",
  slug: "weekend-bookshelf",
  title: "周末整理书架",
  titleTranslation: "Tidying the Bookshelf on Saturday",
  summary:
    "A weekend reset focused on books, memory, and the comfort of putting things back in place.",
  hskLevel: "3",
  type: "journal",
  seriesGroupSlug: "slow-living-notes",
  seriesEpisode: 3,
  sections: [
    {
      hanzi: "今天上午我没有出门，而是在家整理书架。",
      pinyin: "Jin tian shang wu wo mei you chu men, er shi zai jia zheng li shu jia.",
      english: "This morning I stayed home and organized my bookshelf.",
    },
    {
      hanzi: "有些书我已经很久没有看了，可是拿起来的时候还是会想起以前的自己。",
      pinyin:
        "You xie shu wo yi jing hen jiu mei you kan le, ke shi na qi lai de shi hou hai shi hui xiang qi yi qian de zi ji.",
      english:
        "Some books I have not opened in a long time, but picking them up still reminds me of my past self.",
    },
    {
      hanzi: "把东西放回合适的位置，心里也会慢慢安静下来。",
      pinyin: "Ba dong xi fang hui he shi de wei zhi, xin li ye hui man man an jing xia lai.",
      english: "Putting things back in the right place helps my mind settle too.",
    },
  ],
});

const teaBreak = makeStory({
  id: "public-tea-break",
  slug: "tea-break",
  title: "下午的茶休息",
  titleTranslation: "An Afternoon Tea Break",
  summary:
    "A short public lesson from the community about taking a small pause between tasks.",
  hskLevel: "2",
  type: "story",
  authorName: "Community",
  isSeeded: false,
  isPublic: true,
  createdAt: "2026-04-05T00:00:00.000Z",
  sections: [
    {
      hanzi: "下午三点，我给自己泡了一杯热茶。",
      pinyin: "Xia wu san dian, wo gei zi ji pao le yi bei re cha.",
      english: "At three in the afternoon, I made myself a hot cup of tea.",
    },
    {
      hanzi: "我关上电脑五分钟，只看窗外的树和光。",
      pinyin: "Wo guan shang dian nao wu fen zhong, zhi kan chuang wai de shu he guang.",
      english: "I closed my laptop for five minutes and only looked at the trees and light outside.",
    },
    {
      hanzi: "短短的休息以后，我做事更专心了。",
      pinyin: "Duan duan de xiu xi yi hou, wo zuo shi geng zhuan xin le.",
      english: "After the short break, I focused better on my work.",
    },
  ],
});

export const publicStories: AppStory[] = [
  morningMarket,
  subwayRide,
  coffeeChat,
  parkLunch,
  rainyNotes,
  weekendBookshelf,
  teaBreak,
];

export const publicSeries: AppSeries[] = [
  {
    slug: "city-routines",
    title: "城市日常",
    titleTranslation: "City Routines",
    summary:
      "A small collection about the rhythm of daily city life, from markets to subways to after-work coffee.",
    hskLevel: "2",
    isPublic: true,
    ownerUserId: null,
    ownerName: null,
    stories: [morningMarket, subwayRide, coffeeChat],
  },
  {
    slug: "slow-living-notes",
    title: "慢生活笔记",
    titleTranslation: "Slow Living Notes",
    summary:
      "Stories about quieter moments: lunch in the park, rainy afternoons, and slow weekends at home.",
    hskLevel: "3",
    isPublic: true,
    ownerUserId: null,
    ownerName: null,
    stories: [parkLunch, rainyNotes, weekendBookshelf],
  },
];
