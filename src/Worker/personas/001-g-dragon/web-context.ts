import type { WebContextInfo } from '../../../Shared/types';

/**
 * G-Dragon WEBコンテキスト情報
 * 2024年12月時点での最新情報
 */
export const G_DRAGON_WEB_CONTEXT: WebContextInfo = {
  searchDate: '2024年12月17日',
  searchQuery: 'G-Dragon 最新 ニュース 活動 2024 POWER HOME SWEET HOME Übermensch',
  sources: [
    {
      url: 'https://www.ygfamily.com/artist/About.asp?LANGDIV=K&ATYPE=2&ARTIDX=8',
      title: 'YG Entertainment 公式サイト',
      extractedAt: '2024年12月17日',
      reliability: 'high',
      summary: 'G-Dragon公式プロフィールと最新活動情報'
    },
    {
      url: 'https://www.allkpop.com/g-dragon',
      title: 'AllKPop G-Dragon News',
      extractedAt: '2024年12月17日',
      reliability: 'medium',
      summary: 'G-Dragon関連最新ニュースとファン反応'
    }
  ],
  contextData: {
    recentNews: [
      {
        title: '7年4ヶ月ぶりの新曲「POWER」リリース',
        date: '2024年10月31日',
        category: 'release',
        description: '待望のソロ楽曲として大きな話題となった',
        importance: 'high'
      },
      {
        title: 'BIGBANG「HOME SWEET HOME (feat. TAEYANG & DAESUNG)」リリース',
        date: '2024年11月22日',
        category: 'release',
        description: 'BIGBANGとしての楽曲で3人での活動',
        importance: 'high'
      }
    ],
    achievements: [
      {
        title: 'KAIST（韓国科学技術院）機械工学科招聘教授任命',
        date: '2024年6月',
        organization: 'KAIST（韓国科学技術院）',
        description: 'アーティストとしては異例の学術分野での活動',
        category: 'milestone'
      }
    ],
    upcomingEvents: [
      {
        title: '12年ぶりのアルバム「Übermensch」リリース',
        date: '2025年2月25日',
        type: 'release',
        description: '長年のファンが待ち望んでいたフルアルバム',
        endDate: '2025年2月25日'
      },
      {
        title: 'ワールドツアー：東京ドーム・京セラドーム大阪',
        date: '2025年5月10日',
        endDate: '2025年5月31日',
        type: 'concert',
        venue: '東京ドーム5/10　5/11　・京セラドーム大阪　未定',
        description: '久しぶりの大規模ツアー開催予定'
      }
    ],
    collaborations: [
      {
        partner: 'TAEYANG & DAESUNG',
        type: 'music',
        date: '2024年11月22日',
        description: 'BIGBANG「HOME SWEET HOME」での共演',
        status: 'completed'
      }
    ],
    personalUpdates: [
      {
        category: 'behind-scenes',
        date: '2024年11月',
        content: '音楽制作に対する情熱とBIGBANGメンバーとの絆について語る',
        source: 'インタビュー'
      },
      {
        category: 'lifestyle',
        date: '2024年10月',
        content: '新曲制作過程での創作活動について言及',
        source: 'SNS'
      }
    ],
    industryContext: [
      {
        topic: 'K-POP第2世代アーティストの復活',
        relevance: 'G-Dragonの復帰は業界全体に大きな影響',
        date: '2024年10月',
        description: 'レジェンドアーティストとしての位置づけ'
      }
    ]
  }
};
