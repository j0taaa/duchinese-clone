import { z } from "zod";

export const storyTypeValues = ["story", "dialogue", "journal"] as const;
export const storyLevelValues = ["beginner", "elementary", "intermediate"] as const;
export const storyVisibilityValues = [
  "public_seeded",
  "private_user",
  "public_user",
] as const;

export type StoryType = (typeof storyTypeValues)[number];
export type StoryLevel = (typeof storyLevelValues)[number];
export type StoryVisibility = (typeof storyVisibilityValues)[number];

export const storySectionSchema = z.object({
  hanzi: z.string().min(1),
  pinyin: z.string().min(1),
  english: z.string().min(1),
});

export const storySectionsSchema = z.array(storySectionSchema).min(1);

export type StorySection = z.infer<typeof storySectionSchema>;

export type AppStory = {
  id: string;
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  excerpt: string;
  hanziText: string;
  pinyinText: string;
  englishTranslation: string;
  sections: StorySection[];
  type: StoryType;
  level: StoryLevel;
  visibility: StoryVisibility;
  isSeeded: boolean;
  authorUserId: string | null;
  authorName: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SeedStory = Omit<
  AppStory,
  | "id"
  | "visibility"
  | "isSeeded"
  | "authorUserId"
  | "authorName"
  | "createdAt"
  | "updatedAt"
>;

export const storyLevelMeta: Record<
  StoryLevel,
  { label: string; dotClass: string; chipClass: string; hsk: string }
> = {
  beginner: {
    label: "Beginner",
    dotClass: "bg-[#f08b7d]",
    chipClass: "border-[#ffd4ce] bg-[#fff3f1] text-[#b4493e]",
    hsk: "HSK1",
  },
  elementary: {
    label: "Elementary",
    dotClass: "bg-[#79c7b2]",
    chipClass: "border-[#d7f3ea] bg-[#f3fcf8] text-[#2a8a73]",
    hsk: "HSK2",
  },
  intermediate: {
    label: "Intermediate",
    dotClass: "bg-[#699ed5]",
    chipClass: "border-[#d7e7fb] bg-[#f4f8fe] text-[#4777a8]",
    hsk: "HSK3",
  },
};

export const seedStories: SeedStory[] = [
  {
    slug: "morning-market",
    title: "早上的菜市场",
    titleTranslation: "Passing Through the Morning Market",
    type: "story",
    level: "beginner",
    summary:
      "Lin walks through a neighborhood market before breakfast and notices how the city wakes up around her.",
    excerpt: "林娜早上七点去菜市场。市场里很热闹，很多人都在买菜。",
    hanziText:
      "林娜早上七点去菜市场。市场里很热闹，很多人都在买菜。一个老爷爷在卖橘子，一个阿姨在卖豆腐。林娜买了西红柿、鸡蛋和一点青菜。她觉得这样的早晨很舒服，也很有生活气息。",
    pinyinText:
      "Lín Nà zǎo shang qī diǎn qù cài shì chǎng. Shì chǎng lǐ hěn rè nao, hěn duō rén dōu zài mǎi cài. Yí ge lǎo yé ye zài mài jú zi, yí ge ā yí zài mài dòu fu. Lín Nà mǎi le xī hóng shì, jī dàn hé yì diǎn qīng cài. Tā jué de zhè yàng de zǎo chen hěn shū fu, yě hěn yǒu shēng huó qì xī.",
    englishTranslation:
      "At seven in the morning, Lin Na goes to the produce market. It is lively and many people are buying vegetables. A grandfather is selling tangerines, and an auntie is selling tofu. Lin Na buys tomatoes, eggs, and a little green vegetable. She feels mornings like this are comforting and full of everyday life.",
    sections: [
      {
        hanzi: "林娜早上七点去菜市场。市场里很热闹，很多人都在买菜。",
        pinyin:
          "Lín Nà zǎo shang qī diǎn qù cài shì chǎng. Shì chǎng lǐ hěn rè nao, hěn duō rén dōu zài mǎi cài.",
        english:
          "At seven in the morning, Lin Na goes to the produce market. It is lively there, and many people are buying vegetables.",
      },
      {
        hanzi: "一个老爷爷在卖橘子，一个阿姨在卖豆腐，空气里还有刚做好的包子味。",
        pinyin:
          "Yí ge lǎo yé ye zài mài jú zi, yí ge ā yí zài mài dòu fu, kōng qì lǐ hái yǒu gāng zuò hǎo de bāo zi wèi.",
        english:
          "One grandfather is selling tangerines, one auntie is selling tofu, and the air still carries the smell of freshly made steamed buns.",
      },
      {
        hanzi: "林娜买了西红柿、鸡蛋和一点青菜。她觉得这样的早晨很舒服，也很有生活气息。",
        pinyin:
          "Lín Nà mǎi le xī hóng shì, jī dàn hé yì diǎn qīng cài. Tā jué de zhè yàng de zǎo chen hěn shū fu, yě hěn yǒu shēng huó qì xī.",
        english:
          "Lin Na buys tomatoes, eggs, and a little green vegetable. She feels mornings like this are comforting and full of everyday life.",
      },
    ],
  },
  {
    slug: "coffee-chat",
    title: "咖啡店里的对话",
    titleTranslation: "Can I Walk With You After Coffee?",
    type: "dialogue",
    level: "elementary",
    summary:
      "Two friends meet after work and decide how to spend a free evening in the city.",
    excerpt: "下班以后，安娜和小王一起去咖啡店。安娜问：“你今天累不累？”",
    hanziText:
      "下班以后，安娜和小王一起去咖啡店。安娜问：“你今天累不累？”小王说：“有一点，不过我还是想出去走走。最近天气很好，晚上不冷也不热。”安娜笑着说：“那我们先喝咖啡，再去河边散步吧。”小王点点头，说这个主意很好。",
    pinyinText:
      "Xià bān yǐ hòu, Ān Nà hé Xiǎo Wáng yì qǐ qù kā fēi diàn. Ān Nà wèn: nǐ jīn tiān lèi bu lèi? Xiǎo Wáng shuō: yǒu yì diǎn, bú guò wǒ hái shì xiǎng chū qù zǒu zou. Zuì jìn tiān qì hěn hǎo, wǎn shang bù lěng yě bù rè. Ān Nà xiào zhe shuō: nà wǒ men xiān hē kā fēi, zài qù hé biān sàn bù ba. Xiǎo Wáng diǎn diǎn tóu, shuō zhè ge zhǔ yi hěn hǎo.",
    englishTranslation:
      "After work, Anna and Xiao Wang go to a coffee shop together. Anna asks, 'Are you tired today?' Xiao Wang says, 'A little, but I still want to go for a walk. The weather has been great lately, and the evenings are neither cold nor hot.' Anna smiles and says, 'Then let’s drink coffee first and walk by the river afterward.' Xiao Wang nods and says it is a great idea.",
    sections: [
      {
        hanzi: "下班以后，安娜和小王一起去咖啡店。安娜问：“你今天累不累？”",
        pinyin:
          "Xià bān yǐ hòu, Ān Nà hé Xiǎo Wáng yì qǐ qù kā fēi diàn. Ān Nà wèn: nǐ jīn tiān lèi bu lèi?",
        english:
          "After work, Anna and Xiao Wang go to a coffee shop together. Anna asks, 'Are you tired today?'",
      },
      {
        hanzi: "小王说：“有一点，不过我还是想出去走走。最近天气很好，晚上不冷也不热。”",
        pinyin:
          "Xiǎo Wáng shuō: yǒu yì diǎn, bú guò wǒ hái shì xiǎng chū qù zǒu zou. Zuì jìn tiān qì hěn hǎo, wǎn shang bù lěng yě bù rè.",
        english:
          "Xiao Wang says, 'A little, but I still want to go for a walk. The weather has been great lately, and the evenings are neither cold nor hot.'",
      },
      {
        hanzi: "安娜笑着说：“那我们先喝咖啡，再去河边散步吧。”小王点点头，说这个主意很好。",
        pinyin:
          "Ān Nà xiào zhe shuō: nà wǒ men xiān hē kā fēi, zài qù hé biān sàn bù ba. Xiǎo Wáng diǎn diǎn tóu, shuō zhè ge zhǔ yi hěn hǎo.",
        english:
          "Anna smiles and says, 'Then let’s drink coffee first and walk by the river afterward.' Xiao Wang nods and says it is a great idea.",
      },
    ],
  },
  {
    slug: "rainy-notes",
    title: "下雨天的日记",
    titleTranslation: "A Rainy Afternoon Journal",
    type: "journal",
    level: "intermediate",
    summary:
      "A short reflective diary entry about rain, staying inside, and finding a slower rhythm for the day.",
    excerpt: "今天下午一直下雨，所以我没有出去跑步。我坐在窗边，看着外面的树一点一点变湿。",
    hanziText:
      "今天下午一直下雨，所以我没有出去跑步。我坐在窗边，看着外面的树一点一点变湿。本来我觉得这样的天气有一点无聊，可是后来我泡了一杯茶，打开一本很久没有看的书，心情慢慢安静下来。有时候，不能出门也不一定是坏事。慢一点，反而能听见平常听不见的声音，也能看见自己真正想做什么。",
    pinyinText:
      "Jīn tiān xià wǔ yì zhí xià yǔ, suǒ yǐ wǒ méi yǒu chū qù pǎo bù. Wǒ zuò zài chuāng biān, kàn zhe wài miàn de shù yì diǎn yì diǎn biàn shī. Běn lái wǒ jué de zhè yàng de tiān qì yǒu yì diǎn wú liáo, kě shì hòu lái wǒ pào le yì bēi chá, dǎ kāi yì běn hěn jiǔ méi yǒu kàn de shū, xīn qíng màn màn ān jìng xià lái. Yǒu shí hou, bù néng chū mén yě bù yí dìng shì huài shì. Màn yì diǎn, fǎn ér néng tīng jiàn píng cháng tīng bú jiàn de shēng yīn, yě néng kàn jiàn zì jǐ zhēn zhèng xiǎng zuò shén me.",
    englishTranslation:
      "It kept raining this afternoon, so I did not go out for a run. I sat by the window and watched the trees outside slowly become wet. At first I thought weather like this was a little boring, but later I made tea, opened a book I had not read in a long time, and my mood gradually settled down. Sometimes not being able to go out is not necessarily a bad thing. Slowing down can help you hear sounds you usually miss and notice what you truly want to do.",
    sections: [
      {
        hanzi: "今天下午一直下雨，所以我没有出去跑步。我坐在窗边，看着外面的树一点一点变湿。",
        pinyin:
          "Jīn tiān xià wǔ yì zhí xià yǔ, suǒ yǐ wǒ méi yǒu chū qù pǎo bù. Wǒ zuò zài chuāng biān, kàn zhe wài miàn de shù yì diǎn yì diǎn biàn shī.",
        english:
          "It kept raining this afternoon, so I did not go out for a run. I sat by the window and watched the trees outside slowly become wet.",
      },
      {
        hanzi: "本来我觉得这样的天气有一点无聊，可是后来我泡了一杯茶，打开一本很久没有看的书，心情慢慢安静下来。",
        pinyin:
          "Běn lái wǒ jué de zhè yàng de tiān qì yǒu yì diǎn wú liáo, kě shì hòu lái wǒ pào le yì bēi chá, dǎ kāi yì běn hěn jiǔ méi yǒu kàn de shū, xīn qíng màn màn ān jìng xià lái.",
        english:
          "At first I thought weather like this was a little boring, but later I made tea, opened a book I had not read in a long time, and my mood gradually settled down.",
      },
      {
        hanzi: "有时候，不能出门也不一定是坏事。慢一点，反而能听见平常听不见的声音，也能看见自己真正想做什么。",
        pinyin:
          "Yǒu shí hou, bù néng chū mén yě bù yí dìng shì huài shì. Màn yì diǎn, fǎn ér néng tīng jiàn píng cháng tīng bú jiàn de shēng yīn, yě néng kàn jiàn zì jǐ zhēn zhèng xiǎng zuò shén me.",
        english:
          "Sometimes not being able to go out is not necessarily a bad thing. Slowing down can help you hear sounds you usually miss and notice what you truly want to do.",
      },
    ],
  },
];

export function getLevelLabel(level: StoryLevel) {
  return storyLevelMeta[level].label;
}
