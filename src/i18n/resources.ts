export const resources = {
  ja: {
    translation: {
      app: {
        title: 'Real Math Map',
        subtitle: '数学概念と現実世界の応用を同じ地図で探索する'
      },
      controls: {
        searchLabel: 'ノード検索',
        searchPlaceholder: '例: 微分 / Fourier / QR',
        typeFilter: '種別フィルタ',
        industryFilter: '産業カテゴリ',
        kindConcept: '数学概念',
        kindApplication: '応用',
        reset: '絞り込み解除'
      },
      industry: {
        civil_engineering: '土木工学',
        information_theory: '情報理論',
        storage: 'ストレージ',
        communications: '通信',
        finance: '金融',
        medicine: '医療',
        physics: '物理',
        graphics: 'グラフィックス',
        machine_learning: '機械学習',
        cryptography: '暗号',
        manufacturing: '製造',
        logistics: '物流'
      },
      panel: {
        close: '閉じる',
        adjacent: '隣接ノード',
        keywords: '関連キーワード',
        relationHeading: 'このノードが持つ接続',
        utilityProfile: '役立ち方',
        certaintyLevel: '確からしさ',
        difficulty: '難易度',
        shareUrl: '共有URL',
        copyLink: 'リンクをコピー',
        copied: 'コピーしました',
        references: '参考リンク'
      },
      legend: {
        title: '凡例',
        nodeConcept: '数学概念（円）',
        nodeApplication: '応用（四角）',
        edgeConcept: '概念間の関係',
        edgeApplication: '概念→応用',
        edgePrerequisite: '前提',
        edgeUsedIn: '使われる',
        edgeEnables: '可能にする',
        edgeExampleOf: '具体例'
      },
      relation: {
        related_to: '関連',
        prerequisite_of: '前提',
        used_in: '使われる',
        enables: '可能にする',
        example_of: '具体例'
      },
      utilityProfile: {
        direct: '直接的',
        indirect: '基盤的・間接的',
        theoretical: '理論価値中心',
        cultural: '教養・思考訓練',
        emerging: '将来性重視'
      },
      certaintyLevel: {
        high: '高',
        medium: '中',
        low: '低'
      },
      locale: {
        switchToJa: '日本語',
        switchToEn: 'English'
      },
      accessibility: {
        alternativeList: 'ノード一覧（代替操作）',
        openNode: 'ノード詳細を開く',
        graphRegion: '数学概念マップ'
      }
    }
  },
  en: {
    translation: {
      app: {
        title: 'Real Math Map',
        subtitle: 'Explore math concepts and real-world applications on one map'
      },
      controls: {
        searchLabel: 'Search Nodes',
        searchPlaceholder: 'e.g. derivative / Fourier / QR',
        typeFilter: 'Type Filter',
        industryFilter: 'Industry Filter',
        kindConcept: 'Math Concept',
        kindApplication: 'Application',
        reset: 'Reset Filters'
      },
      industry: {
        civil_engineering: 'Civil Engineering',
        information_theory: 'Information Theory',
        storage: 'Storage',
        communications: 'Communications',
        finance: 'Finance',
        medicine: 'Medicine',
        physics: 'Physics',
        graphics: 'Graphics',
        machine_learning: 'Machine Learning',
        cryptography: 'Cryptography',
        manufacturing: 'Manufacturing',
        logistics: 'Logistics'
      },
      panel: {
        close: 'Close',
        adjacent: 'Adjacent Nodes',
        keywords: 'Keywords',
        relationHeading: 'Connections from this node',
        utilityProfile: 'Utility profile',
        certaintyLevel: 'Confidence',
        difficulty: 'Difficulty',
        shareUrl: 'Share URL',
        copyLink: 'Copy link',
        copied: 'Copied',
        references: 'References'
      },
      legend: {
        title: 'Legend',
        nodeConcept: 'Math concept (circle)',
        nodeApplication: 'Application (square)',
        edgeConcept: 'Concept-to-concept',
        edgeApplication: 'Concept-to-application',
        edgePrerequisite: 'Prerequisite',
        edgeUsedIn: 'Used in',
        edgeEnables: 'Enables',
        edgeExampleOf: 'Example of'
      },
      relation: {
        related_to: 'Related',
        prerequisite_of: 'Prerequisite',
        used_in: 'Used in',
        enables: 'Enables',
        example_of: 'Example of'
      },
      utilityProfile: {
        direct: 'Direct',
        indirect: 'Indirect / foundational',
        theoretical: 'Theoretical',
        cultural: 'Cultural / thinking skill',
        emerging: 'Emerging'
      },
      certaintyLevel: {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      },
      locale: {
        switchToJa: '日本語',
        switchToEn: 'English'
      },
      accessibility: {
        alternativeList: 'Node list (alternative access)',
        openNode: 'Open node details',
        graphRegion: 'Math concept map'
      }
    }
  }
} as const;
