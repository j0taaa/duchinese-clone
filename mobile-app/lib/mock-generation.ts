import { slugify } from "@/lib/content";
import type {
  AppSeries,
  AppStory,
  GenerationInput,
  StorySection,
  UsageEntry,
} from "@/types/content";

const titleRoots = {
  story: ["新的练习", "城市片段", "今天的小故事"],
  dialogue: ["一起聊聊", "路上的对话", "两个朋友"],
  journal: ["今天的记录", "慢一点", "一个安静的下午"],
} as const;

const sectionTemplates: Record<
  GenerationInput["type"],
  Record<GenerationInput["hskLevel"], StorySection[]>
> = {
  story: {
    "1": [
      {
        hanzi: "今天我去一家小店。店里很安静，老板对我笑了一下。",
        pinyin: "Jin tian wo qu yi jia xiao dian. Dian li hen an jing, lao ban dui wo xiao le yi xia.",
        english: "Today I went to a small shop. It was quiet inside, and the owner smiled at me.",
      },
      {
        hanzi: "我买了一点吃的，也买了一杯热茶。",
        pinyin: "Wo mai le yi dian chi de, ye mai le yi bei re cha.",
        english: "I bought a little food and a hot tea.",
      },
      {
        hanzi: "回家的路上，我觉得这一天很简单，可是很好。",
        pinyin: "Hui jia de lu shang, wo jue de zhe yi tian hen jian dan, ke shi hen hao.",
        english: "On the way home, I felt the day was simple, but good.",
      },
    ],
    "2": [
      {
        hanzi: "下课以后，我没有马上回家，而是在学校附近走了一会儿。",
        pinyin: "Xia ke yi hou, wo mei you ma shang hui jia, er shi zai xue xiao fu jin zou le yi hui er.",
        english: "After class, I did not go straight home and walked around near school for a while.",
      },
      {
        hanzi: "路边有一家新开的面包店，闻起来很香，所以我进去看看。",
        pinyin: "Lu bian you yi jia xin kai de mian bao dian, wen qi lai hen xiang, suo yi wo jin qu kan kan.",
        english: "There was a new bakery by the road, and it smelled good, so I went in.",
      },
      {
        hanzi: "有时候，一个小决定就能让普通的下午变得特别一点。",
        pinyin: "You shi hou, yi ge xiao jue ding jiu neng rang pu tong de xia wu bian de te bie yi dian.",
        english: "Sometimes one small decision can make an ordinary afternoon feel more special.",
      },
    ],
    "3": [
      {
        hanzi: "原来我只想把事情做完，可是后来发现，过程里的细节反而更值得记住。",
        pinyin:
          "Yuan lai wo zhi xiang ba shi qing zuo wan, ke shi hou lai fa xian, guo cheng li de xi jie fan er geng zhi de ji zhu.",
        english:
          "At first I only wanted to finish the task, but later I realized the details along the way were more worth remembering.",
      },
      {
        hanzi: "我停下来观察周围的人，他们每个人都像在自己的故事里慢慢前进。",
        pinyin:
          "Wo ting xia lai guan cha zhou wei de ren, ta men mei ge ren dou xiang zai zi ji de gu shi li man man qian jin.",
        english:
          "I paused to observe the people around me, and each seemed to be moving slowly through their own story.",
      },
      {
        hanzi: "这种感觉提醒我，学习语言也是一样，要给自己一点空间。",
        pinyin: "Zhe zhong gan jue ti xing wo, xue xi yu yan ye shi yi yang, yao gei zi ji yi dian kong jian.",
        english: "It reminded me that language learning is the same: you have to give yourself some room.",
      },
    ],
    "4": [
      {
        hanzi: "原本只是一次普通的出门，最后却变成了重新整理思路的机会。",
        pinyin: "Yuan ben zhi shi yi ci pu tong de chu men, zui hou que bian cheng le chong xin zheng li si lu de ji hui.",
        english: "What started as an ordinary outing became a chance to reorganize my thoughts.",
      },
      {
        hanzi: "我发现自己并不需要太多安排，只要有一点好奇心，就会看见新的东西。",
        pinyin: "Wo fa xian zi ji bing bu xu yao tai duo an pai, zhi yao you yi dian hao qi xin, jiu hui kan jian xin de dong xi.",
        english: "I realized I do not need many plans. A little curiosity is enough to notice something new.",
      },
      {
        hanzi: "这样的练习对阅读和生活都很有帮助。",
        pinyin: "Zhe yang de lian xi dui yue du he sheng huo dou hen you bang zhu.",
        english: "This kind of practice helps both reading and everyday life.",
      },
    ],
    "5": [
      {
        hanzi: "当我重新审视这段经历时，才意识到真正留下来的并不是结果，而是观察世界的方式。",
        pinyin:
          "Dang wo chong xin shen shi zhe duan jing li shi, cai yi shi dao zhen zheng liu xia lai de bing bu shi jie guo, er shi guan cha shi jie de fang shi.",
        english:
          "When I looked back on the experience, I realized what stayed with me was not the result but the way of observing the world.",
      },
      {
        hanzi: "如果能把这种敏感带进语言学习，很多内容都会变得更生动。",
        pinyin:
          "Ru guo neng ba zhe zhong min gan dai jin yu yan xue xi, hen duo nei rong dou hui bian de geng sheng dong.",
        english:
          "If you bring that sensitivity into language study, much of the content becomes more vivid.",
      },
      {
        hanzi: "我想，这也是我愿意一直读下去的原因。",
        pinyin: "Wo xiang, zhe ye shi wo yuan yi yi zhi du xia qu de yuan yin.",
        english: "I think that is also why I want to keep reading.",
      },
    ],
    "6": [
      {
        hanzi: "随着内容逐渐展开，我开始意识到，真正推动理解前进的并不是速度，而是反复体会细节的耐心。",
        pinyin:
          "Sui zhe nei rong zhu jian zhan kai, wo kai shi yi shi dao, zhen zheng tui dong li jie qian jin de bing bu shi su du, er shi fan fu ti hui xi jie de nai xin.",
        english:
          "As the material unfolded, I realized that what truly advances understanding is not speed, but patience with detail.",
      },
      {
        hanzi: "这种耐心让语言不再只是知识点，而是一种可以慢慢进入的经验。",
        pinyin:
          "Zhe zhong nai xin rang yu yan bu zai zhi shi zhi shi dian, er shi yi zhong ke yi man man jin ru de jing yan.",
        english:
          "That patience makes language more than a set of facts. It becomes an experience you can enter gradually.",
      },
      {
        hanzi: "也正因为如此，每一次阅读都可能带来新的层次。",
        pinyin: "Ye zheng yin wei ru ci, mei yi ci yue du dou ke neng dai lai xin de ceng ci.",
        english: "Because of that, every reading can reveal a new layer.",
      },
    ],
  },
  dialogue: {
    "1": [
      {
        hanzi: "你今天忙不忙？我今天还好。",
        pinyin: "Ni jin tian mang bu mang? Wo jin tian hai hao.",
        english: "Are you busy today? I am doing okay today.",
      },
      {
        hanzi: "要不要一起去喝咖啡？好啊，我正想休息一下。",
        pinyin: "Yao bu yao yi qi qu he ka fei? Hao a, wo zheng xiang xiu xi yi xia.",
        english: "Do you want to get coffee together? Sure, I was just thinking about taking a break.",
      },
      {
        hanzi: "那我们走吧。现在去正好。",
        pinyin: "Na wo men zou ba. Xian zai qu zheng hao.",
        english: "Then let's go. Now is a good time.",
      },
    ],
    "2": [
      {
        hanzi: "你刚才说的那个地方在哪里？就在地铁站后面，不太远。",
        pinyin:
          "Ni gang cai shuo de na ge di fang zai na li? Jiu zai di tie zhan hou mian, bu tai yuan.",
        english:
          "Where is that place you mentioned? It is right behind the subway station, not far.",
      },
      {
        hanzi: "我们先去看看吧。如果人太多，再换一家也可以。",
        pinyin: "Wo men xian qu kan kan ba. Ru guo ren tai duo, zai huan yi jia ye ke yi.",
        english: "Let's check it out first. If it is too crowded, we can switch to another place.",
      },
      {
        hanzi: "听起来不错，反正今天晚上我不想太赶。",
        pinyin: "Ting qi lai bu cuo, fan zheng jin tian wan shang wo bu xiang tai gan.",
        english: "Sounds good. I do not want to rush tonight anyway.",
      },
    ],
    "3": [
      {
        hanzi: "最近你是不是有点累？我看你这几天一直在忙。",
        pinyin:
          "Zui jin ni shi bu shi you dian lei? Wo kan ni zhe ji tian yi zhi zai mang.",
        english: "Have you been a bit tired lately? You have seemed busy these past few days.",
      },
      {
        hanzi: "是有一点，不过我发现如果晚上出去走一走，心情会慢慢放松下来。",
        pinyin:
          "Shi you yi dian, bu guo wo fa xian ru guo wan shang chu qu zou yi zou, xin qing hui man man fang song xia lai.",
        english:
          "A little, yes. But I have noticed that if I go out for a walk in the evening, I gradually relax.",
      },
      {
        hanzi: "那今天就不要想太多，我们先吃点东西，再慢慢聊。",
        pinyin: "Na jin tian jiu bu yao xiang tai duo, wo men xian chi dian dong xi, zai man man liao.",
        english: "Then let's not overthink today. We can eat something first and talk slowly.",
      },
    ],
    "4": [
      {
        hanzi: "如果我们把计划排得太满，最后反而没有真正休息到。",
        pinyin: "Ru guo wo men ba ji hua pai de tai man, zui hou fan er mei you zhen zheng xiu xi dao.",
        english: "If we pack the schedule too full, we may not actually rest.",
      },
      {
        hanzi: "我同意，所以我更想找一个能慢慢坐下来的地方。",
        pinyin: "Wo tong yi, suo yi wo geng xiang zhao yi ge neng man man zuo xia lai de di fang.",
        english: "I agree, so I would rather find a place where we can sit down slowly.",
      },
      {
        hanzi: "那就按这个想法来，今天不用追求效率。",
        pinyin: "Na jiu an zhe ge xiang fa lai, jin tian bu yong zhui qiu xiao lu.",
        english: "Then let's follow that idea. We do not need to chase efficiency today.",
      },
    ],
    "5": [
      {
        hanzi: "有时候最有价值的谈话，并不是提前准备好的，而是在放松的时候自然发生的。",
        pinyin:
          "You shi hou zui you jia zhi de tan hua, bing bu shi ti qian zhun bei hao de, er shi zai fang song de shi hou zi ran fa sheng de.",
        english:
          "Sometimes the most valuable conversations are not planned in advance, but happen naturally when people relax.",
      },
      {
        hanzi: "也许正因为没有目的，我们才更容易说出真正想表达的东西。",
        pinyin:
          "Ye xu zheng yin wei mei you mu di, wo men cai geng rong yi shuo chu zhen zheng xiang biao da de dong xi.",
        english:
          "Perhaps precisely because there is no agenda, it becomes easier to say what we really mean.",
      },
      {
        hanzi: "那今天就把时间留给这种自然感吧。",
        pinyin: "Na jin tian jiu ba shi jian liu gei zhe zhong zi ran gan ba.",
        english: "Then let's leave time for that natural feeling today.",
      },
    ],
    "6": [
      {
        hanzi: "越是在节奏很快的时候，我越觉得一段真诚的对话能重新整理人的状态。",
        pinyin:
          "Yue shi zai jie zou hen kuai de shi hou, wo yue jue de yi duan zhen cheng de dui hua neng chong xin zheng li ren de zhuang tai.",
        english:
          "The faster life moves, the more I feel that a sincere conversation can reset a person.",
      },
      {
        hanzi: "它不一定解决问题，但会让人重新找到理解彼此的空间。",
        pinyin:
          "Ta bu yi ding jie jue wen ti, dan hui rang ren chong xin zhao dao li jie bi ci de kong jian.",
        english:
          "It does not always solve the problem, but it restores room for mutual understanding.",
      },
      {
        hanzi: "所以今晚最重要的，也许只是把注意力真正放在对方身上。",
        pinyin:
          "Suo yi jin wan zui zhong yao de, ye xu zhi shi ba zhu yi li zhen zheng fang zai dui fang shen shang.",
        english:
          "So perhaps the most important thing tonight is simply to give the other person real attention.",
      },
    ],
  },
  journal: {
    "1": [
      {
        hanzi: "今天晚上我很早回家。",
        pinyin: "Jin tian wan shang wo hen zao hui jia.",
        english: "I came home early tonight.",
      },
      {
        hanzi: "我先洗了一个热水澡，然后坐下来喝水。",
        pinyin: "Wo xian xi le yi ge re shui zao, ran hou zuo xia lai he shui.",
        english: "I took a hot shower first and then sat down to drink water.",
      },
      {
        hanzi: "安静的时候，我觉得心里也慢慢安静了。",
        pinyin: "An jing de shi hou, wo jue de xin li ye man man an jing le.",
        english: "When things are quiet, I feel my mind becomes quiet too.",
      },
    ],
    "2": [
      {
        hanzi: "今天的事情不算少，可是我还是想给自己留一点安静的时间。",
        pinyin:
          "Jin tian de shi qing bu suan shao, ke shi wo hai shi xiang gei zi ji liu yi dian an jing de shi jian.",
        english: "I had a fair number of things to do today, but I still wanted to leave some quiet time for myself.",
      },
      {
        hanzi: "我把手机放在一边，给自己泡了一杯茶，然后慢慢写下今天想到的事。",
        pinyin:
          "Wo ba shou ji fang zai yi bian, gei zi ji pao le yi bei cha, ran hou man man xie xia jin tian xiang dao de shi.",
        english: "I put my phone aside, made tea, and slowly wrote down what I thought about today.",
      },
      {
        hanzi: "这样的习惯不能马上改变生活，却会让我更清楚自己现在在哪里。",
        pinyin:
          "Zhe yang de xi guan bu neng ma shang gai bian sheng huo, que hui rang wo geng qing chu zi ji xian zai zai na li.",
        english:
          "A habit like this does not change life immediately, but it helps me see more clearly where I am now.",
      },
    ],
    "3": [
      {
        hanzi: "最近我常常提醒自己，不要只看今天完成了多少事情，也要看自己有没有认真感受这一天。",
        pinyin:
          "Zui jin wo chang chang ti xing zi ji, bu yao zhi kan jin tian wan cheng le duo shao shi qing, ye yao kan zi ji you mei you ren zhen gan shou zhe yi tian.",
        english:
          "Lately I keep reminding myself not to measure the day only by how much I finished, but by whether I really felt it.",
      },
      {
        hanzi: "如果一直向前赶，很容易忘记为什么开始，也容易忽略已经得到的东西。",
        pinyin:
          "Ru guo yi zhi xiang qian gan, hen rong yi wang ji wei shen me kai shi, ye rong yi hu lue yi jing de dao de dong xi.",
        english:
          "If I am always rushing forward, it becomes easy to forget why I began and easy to miss what I already have.",
      },
      {
        hanzi: "写下来以后，我对自己的状态会诚实一点，也会温柔一点。",
        pinyin:
          "Xie xia lai yi hou, wo dui zi ji de zhuang tai hui cheng shi yi dian, ye hui wen rou yi dian.",
        english: "After writing things down, I can be more honest and kinder with myself.",
      },
    ],
    "4": [
      {
        hanzi: "把想法写成句子的过程，其实也是整理情绪和判断优先级的过程。",
        pinyin:
          "Ba xiang fa xie cheng ju zi de guo cheng, qi shi ye shi zheng li qing xu he pan duan you xian ji de guo cheng.",
        english:
          "The process of turning thoughts into sentences is also a process of organizing emotions and setting priorities.",
      },
      {
        hanzi: "当我慢慢写的时候，很多原本模糊的感受会变得具体。",
        pinyin: "Dang wo man man xie de shi hou, hen duo yuan ben mo hu de gan shou hui bian de ju ti.",
        english: "When I write slowly, many feelings that were vague begin to take shape.",
      },
      {
        hanzi: "也许这就是记录的意义，它不是为了完美，而是为了看清。",
        pinyin: "Ye xu zhe jiu shi ji lu de yi yi, ta bu shi wei le wan mei, er shi wei le kan qing.",
        english: "Maybe that is the meaning of journaling. It is not for perfection, but for clarity.",
      },
    ],
    "5": [
      {
        hanzi: "每当外部节奏变快，我就更需要一种可以把注意力带回自身的方式。",
        pinyin:
          "Mei dang wai bu jie zou bian kuai, wo jiu geng xu yao yi zhong ke yi ba zhu yi li dai hui zi shen de fang shi.",
        english:
          "Whenever the outside pace speeds up, I need an approach that can bring my attention back to myself.",
      },
      {
        hanzi: "书写让那些零散的念头有机会彼此连接，也让我重新确认什么值得投入时间。",
        pinyin:
          "Shu xie rang na xie ling san de nian tou you ji hui bi ci lian jie, ye rang wo chong xin que ren shen me zhi de tou ru shi jian.",
        english:
          "Writing lets scattered thoughts connect with each other and helps me confirm again what is worth my time.",
      },
      {
        hanzi: "这种安静不是逃避，而是一种更有意识的整理。",
        pinyin: "Zhe zhong an jing bu shi tao bi, er shi yi zhong geng you yi shi de zheng li.",
        english: "This quiet is not avoidance. It is a more conscious form of order.",
      },
    ],
    "6": [
      {
        hanzi: "在复杂的信息和任务之间，能够保留一段与自己对话的时间，本身就是一种能力。",
        pinyin:
          "Zai fu za de xin xi he ren wu zhi jian, neng gou bao liu yi duan yu zi ji dui hua de shi jian, ben shen jiu shi yi zhong neng li.",
        english:
          "Amid complex information and tasks, preserving time to converse with yourself is already a skill.",
      },
      {
        hanzi: "它帮助人从被动反应转向主动理解，也让思考拥有更深的层次。",
        pinyin:
          "Ta bang zhu ren cong bei dong fan ying zhuan xiang zhu dong li jie, ye rang si kao yong you geng shen de ceng ci.",
        english:
          "It helps a person move from passive reaction to active understanding and gives thought more depth.",
      },
      {
        hanzi: "所以我愿意把这件小事长期保留下来，因为它会不断改变我看待自己的方式。",
        pinyin:
          "Suo yi wo yuan yi ba zhe jian xiao shi chang qi bao liu xia lai, yin wei ta hui bu duan gai bian wo kan dai zi ji de fang shi.",
        english:
          "That is why I want to keep this small practice for the long term. It keeps changing how I see myself.",
      },
    ],
  },
};

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildStoryId(seed: number) {
  return `generated-${seed}`;
}

function buildTitle(input: GenerationInput, seed: number, episode?: number) {
  const root = titleRoots[input.type][seed % titleRoots[input.type].length];
  const suffix = episode ? ` 第${episode}课` : "";
  const englishPrompt = input.topic.trim();
  const englishLabel = englishPrompt ? englishPrompt : "Fresh reading practice";

  return {
    title: `${root}${suffix}`,
    titleTranslation: episode
      ? `${englishLabel} · Episode ${episode}`
      : englishLabel,
  };
}

function buildSections(input: GenerationInput, episode?: number) {
  const base = sectionTemplates[input.type][input.hskLevel];
  const reviewCharacters = input.reviewCharacters?.slice(0, 3) ?? [];

  if (!episode && reviewCharacters.length === 0) {
    return base;
  }

  return base.map((section, index) => {
    if (index !== 0) {
      return section;
    }

    const reviewLead =
      reviewCharacters.length > 0
        ? `复习字 ${reviewCharacters.join("")}。`
        : "";
    const reviewLeadPinyin =
      reviewCharacters.length > 0 ? `Fu xi zi ${reviewCharacters.join(" ")}. ` : "";
    const reviewLeadEnglish =
      reviewCharacters.length > 0
        ? `Review characters ${reviewCharacters.join(", ")}. `
        : "";

    return {
      hanzi: `${episode ? `第${episode}天，` : ""}${reviewLead}${section.hanzi}`,
      pinyin: `${episode ? `Di ${episode} tian, ` : ""}${reviewLeadPinyin}${section.pinyin}`,
      english: `${episode ? `Day ${episode}: ` : ""}${reviewLeadEnglish}${section.english}`,
    };
  });
}

function buildUsage(seed: number, title: string, mode: GenerationInput["mode"]): UsageEntry {
  const promptTokens = 220 + seed * 3;
  const completionTokens = mode === "series" ? 980 + seed * 7 : 340 + seed * 5;
  const totalTokens = promptTokens + completionTokens;
  return {
    id: `usage-${seed}`,
    createdAt: new Date().toISOString(),
    title,
    promptTokens,
    completionTokens,
    totalTokens,
    costCredits: mode === "series" ? "0.0264" : "0.0092",
  };
}

function buildStory(
  input: GenerationInput,
  seed: number,
  episode?: number,
  seriesGroupSlug?: string,
): AppStory {
  const { title, titleTranslation } = buildTitle(input, seed, episode);
  const sections = buildSections(input, episode);
  const slugBase = episode ? `${titleTranslation}-${episode}` : titleTranslation;

  return {
    id: buildStoryId(seed + (episode ?? 0)),
    slug: `${slugify(slugBase || `lesson-${seed}`)}-${seed}${episode ? `-${episode}` : ""}`,
    title,
    titleTranslation,
    summary: input.topic.trim()
      ? `Generated ${input.type} practice around "${input.topic.trim()}" for ${input.length} ${input.mode}.`
      : `Generated ${input.type} practice for a ${input.length} ${input.mode}.`,
    excerpt: sections[0]?.hanzi ?? "",
    hskLevel: input.hskLevel,
    type: input.type,
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorName: "You",
    authorUserId: "mobile-self",
    authorImage: null,
    isSeeded: false,
    isPublic: input.visibility === "public",
    seriesGroupSlug: seriesGroupSlug ?? null,
    seriesEpisode: episode ?? null,
  };
}

export async function simulateGeneration(input: GenerationInput, seed: number) {
  await delay(900);

  if (input.mode === "story") {
    const story = buildStory(input, seed);
    return {
      kind: "story" as const,
      story,
      usage: buildUsage(seed, story.titleTranslation, "story"),
    };
  }

  const seriesSlug = `${slugify(input.topic || "generated-series")}-${seed}`;
  const stories = [1, 2, 3].map((episode) =>
    buildStory(input, seed + episode, episode, seriesSlug),
  );
  const seriesTitle = input.topic.trim() || "Generated Series";
  const series: AppSeries = {
    slug: seriesSlug,
    title: `系列 ${seed}`,
    titleTranslation: seriesTitle,
    summary: `Three connected ${input.type} lessons at ${input.length} length for ${input.topic.trim() || "general practice"}.`,
    hskLevel: input.hskLevel,
    stories,
    isPublic: input.visibility === "public",
    ownerUserId: "mobile-self",
    ownerName: "You",
  };

  return {
    kind: "series" as const,
    series,
    stories,
    usage: buildUsage(seed, series.titleTranslation, "series"),
  };
}

export async function simulateSeriesAppendEpisode(input: {
  seed: number;
  series: AppSeries;
  type: GenerationInput["type"];
  hskLevel: GenerationInput["hskLevel"];
  length: GenerationInput["length"];
  visibility: GenerationInput["visibility"];
}) {
  await delay(700);

  const nextEpisode = input.series.stories.length + 1;
  const story = buildStory(
    {
      topic: input.series.titleTranslation,
      hskLevel: input.hskLevel,
      type: input.type,
      length: input.length,
      visibility: input.visibility,
      mode: "story",
      reviewCharacters: [],
    },
    input.seed,
    nextEpisode,
    input.series.slug,
  );

  return {
    story,
    usage: buildUsage(input.seed, story.titleTranslation, "story"),
  };
}
