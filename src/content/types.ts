export const NODE_KINDS = [
  'pure_concept',
  'application',
  'theorem',
  'method',
  'historical_person',
  'field',
  'tool_or_product',
  'profession'
] as const;

export const INDUSTRY_CATEGORIES = [
  'civil_engineering',
  'information_theory',
  'storage',
  'communications',
  'finance',
  'medicine',
  'physics',
  'graphics',
  'machine_learning',
  'cryptography',
  'manufacturing',
  'logistics'
] as const;

export const EDGE_RELATIONS = [
  'related_to',
  'prerequisite_of',
  'used_in',
  'enables',
  'example_of'
] as const;

export const UTILITY_PROFILES = [
  'direct',
  'indirect',
  'theoretical',
  'cultural',
  'emerging'
] as const;

export const CONTENT_STATUSES = ['draft', 'reviewed'] as const;

export type NodeKind = (typeof NODE_KINDS)[number];
export type IndustryCategory = (typeof INDUSTRY_CATEGORIES)[number];
export type EdgeRelation = (typeof EDGE_RELATIONS)[number];
export type UtilityProfile = (typeof UTILITY_PROFILES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type Locale = 'ja' | 'en';

export type LocaleText = {
  ja: string;
  en: string;
};

export type GraphNode = {
  id: string;
  kind: NodeKind;
  industryCategory?: IndustryCategory | undefined;
  labels: LocaleText;
  aliases: string[];
  shortSummary: LocaleText;
  friendlyExplanation: LocaleText;
  detailedExplanation: LocaleText;
  mathNotationLatex?:
    | {
        inline?: string[];
        block?: string[];
      }
    | undefined;
  keywords: LocaleText[];
  relations?:
    | {
        targetId: string;
        relation: EdgeRelation;
      }[]
    | undefined;
  references: {
    title: string;
    url?: string;
    note?: LocaleText;
  }[];
  tags: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  utilityProfile: UtilityProfile;
  certaintyLevel: 'high' | 'medium' | 'low';
  status: ContentStatus;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  relation: EdgeRelation;
  note?: LocaleText | undefined;
};

export type GraphContent = {
  version: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};
