import type {
  EdgeRelation,
  GraphEdge,
  GraphNode,
  IndustryCategory
} from '../content/types';

export const INDUSTRY_COLORS: Record<IndustryCategory, string> = {
  civil_engineering: '#D95F02',
  information_theory: '#1B9E77',
  storage: '#7570B3',
  communications: '#66A61E',
  finance: '#A6761D',
  medicine: '#E7298A',
  physics: '#E6AB02',
  graphics: '#A6CEE3',
  machine_learning: '#FB9A99',
  cryptography: '#6A3D9A',
  manufacturing: '#B15928',
  logistics: '#4E79A7'
};

export const PURE_CONCEPT_COLOR = '#1D4ED8';
export const PURE_CONCEPT_BORDER = '#0F2F8A';

export const getNodeColor = (node: GraphNode): string => {
  if (node.kind === 'application' && node.industryCategory) {
    return INDUSTRY_COLORS[node.industryCategory];
  }
  return PURE_CONCEPT_COLOR;
};

export const getRelationDash = (relation: EdgeRelation): number[] | null => {
  switch (relation) {
    case 'prerequisite_of':
      return [8, 5];
    case 'example_of':
      return [2, 4];
    case 'related_to':
      return [4, 6];
    default:
      return null;
  }
};

export const getEdgeWidth = (
  edge: GraphEdge,
  source?: GraphNode,
  target?: GraphNode
): number => {
  const conceptToApplication =
    source?.kind === 'pure_concept' && target?.kind === 'application';
  if (edge.relation === 'enables') {
    return 2.5;
  }
  return conceptToApplication ? 2.1 : 1.5;
};

export const getEdgeColor = (
  edge: GraphEdge,
  source?: GraphNode,
  target?: GraphNode
): string => {
  const conceptToApplication =
    source?.kind === 'pure_concept' && target?.kind === 'application';
  if (edge.relation === 'prerequisite_of') {
    return '#4B5563';
  }
  if (conceptToApplication) {
    return '#0F766E';
  }
  return '#64748B';
};
