import type { GraphNode, Locale } from '../content/types';
import { getNodeLabel } from '../lib/graph';
import { useTranslation } from 'react-i18next';

type NodeListProps = {
  locale: Locale;
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
};

export const NodeList = ({
  locale,
  nodes,
  selectedNodeId,
  onSelectNode
}: NodeListProps) => {
  const { t } = useTranslation();

  return (
    <details className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">
        {t('accessibility.alternativeList')}
      </summary>
      <ul className="mt-3 max-h-64 space-y-1 overflow-auto pr-1 text-sm">
        {nodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelectNode(node.id)}
              className={`w-full rounded-md px-2 py-1 text-left ${
                selectedNodeId === node.id
                  ? 'bg-sky-100 text-sky-900'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              aria-label={`${t('accessibility.openNode')}: ${getNodeLabel(node, locale)}`}
            >
              {getNodeLabel(node, locale)}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
};
