import { useMemo, useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { useTranslation } from 'react-i18next';
import type { GraphEdge, GraphNode, Locale } from '../content/types';
import { getNodeLabel } from '../lib/graph';

type Adjacent = {
  node: GraphNode;
  relation: GraphEdge['relation'];
};

type DetailPanelProps = {
  locale: Locale;
  node: GraphNode;
  allEdges: GraphEdge[];
  nodesById: Map<string, GraphNode>;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  shareUrl: string;
  panelTitleRef: React.RefObject<HTMLHeadingElement | null>;
};

export const DetailPanel = ({
  locale,
  node,
  allEdges,
  nodesById,
  onClose,
  onSelectNode,
  shareUrl,
  panelTitleRef
}: DetailPanelProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const adjacentNodes = useMemo<Adjacent[]>(
    () =>
      allEdges.flatMap((edge) => {
        if (edge.source === node.id) {
          const target = nodesById.get(edge.target);
          return target ? [{ node: target, relation: edge.relation }] : [];
        }
        if (edge.target === node.id) {
          const source = nodesById.get(edge.source);
          return source ? [{ node: source, relation: edge.relation }] : [];
        }
        return [];
      }),
    [allEdges, node.id, nodesById]
  );

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const keywords = node.keywords.map((keyword) => keyword[locale]).join(' / ');

  return (
    <section
      className="h-full overflow-auto border-t border-slate-200 bg-white px-5 py-4 lg:border-t-0 lg:border-l"
      role="dialog"
      aria-label={getNodeLabel(node, locale)}
      aria-modal="false"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2
            ref={panelTitleRef}
            tabIndex={-1}
            className="text-xl font-bold text-slate-900 outline-none"
          >
            {getNodeLabel(node, locale)}
          </h2>
          <p className="text-sm text-slate-500">
            {node.labels[locale === 'ja' ? 'en' : 'ja']}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          {t('panel.close')}
        </button>
      </div>

      <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
        {node.shortSummary[locale]}
      </p>

      <article className="mt-4 space-y-3 text-sm text-slate-800">
        <section>
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
            Friendly
          </h3>
          <p>{node.friendlyExplanation[locale]}</p>
        </section>
        <section>
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
            Deep Dive
          </h3>
          <p>{node.detailedExplanation[locale]}</p>
        </section>
      </article>

      {node.mathNotationLatex && (
        <section className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          {node.mathNotationLatex.inline?.map((inlineLatex) => (
            <p key={inlineLatex}>
              <InlineMath math={inlineLatex} />
            </p>
          ))}
          {node.mathNotationLatex.block?.map((blockLatex) => (
            <BlockMath key={blockLatex} math={blockLatex} />
          ))}
        </section>
      )}

      <section className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-700">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="font-semibold">{t('panel.utilityProfile')}</p>
          <p>{t(`utilityProfile.${node.utilityProfile}`)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="font-semibold">{t('panel.certaintyLevel')}</p>
          <p>{t(`certaintyLevel.${node.certaintyLevel}`)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="font-semibold">{t('panel.difficulty')}</p>
          <p>{node.difficultyLevel}/5</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="font-semibold">{t('panel.keywords')}</p>
          <p>{keywords}</p>
        </div>
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          {t('panel.relationHeading')}
        </h3>
        <ul className="space-y-2">
          {adjacentNodes.map((item) => (
            <li
              key={`${item.node.id}-${item.relation}`}
              className="rounded-lg border border-slate-200 p-2"
            >
              <button
                type="button"
                className="font-medium text-sky-700 hover:text-sky-900"
                onClick={() => onSelectNode(item.node.id)}
              >
                {getNodeLabel(item.node, locale)}
              </button>
              <p className="text-xs text-slate-600">
                {t(`relation.${item.relation}`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          {t('panel.shareUrl')}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="min-w-[220px] flex-1 rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700"
          />
          <button
            type="button"
            onClick={() => void copyShareUrl()}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            {copied ? t('panel.copied') : t('panel.copyLink')}
          </button>
        </div>
      </section>

      {node.references.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            {t('panel.references')}
          </h3>
          <ul className="space-y-1 text-sm">
            {node.references.map((reference) => (
              <li key={reference.title}>
                {reference.url ? (
                  <a
                    className="text-sky-700 hover:text-sky-900 hover:underline"
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {reference.title}
                  </a>
                ) : (
                  <span>{reference.title}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
};
