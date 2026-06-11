import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DetailPanel } from './components/DetailPanel';
import { GraphCanvas } from './components/GraphCanvas';
import { Legend } from './components/Legend';
import { NodeList } from './components/NodeList';
import { SearchFilters } from './components/SearchFilters';
import { ErrorFallback } from './components/ErrorBoundary';
import { contentLoadError, graphContent } from './content/loadContent';
import { INDUSTRY_CATEGORIES, type Locale } from './content/types';
import {
  createAdjacencyIndex,
  filterGraph,
  getNodeSearchText,
  getHighlightedNodeIds,
  isSupportedLocale
} from './lib/graph';
import { getNodeIdFromSearch, withNodeId } from './lib/urlState';

const DEFAULT_KIND_FILTER = new Set<'pure_concept' | 'application'>([
  'pure_concept',
  'application'
]);
const DEFAULT_INDUSTRY_FILTER = new Set<string>(INDUSTRY_CATEGORIES);

const AppPage = () => {
  const { locale: localeParam } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<
    Set<'pure_concept' | 'application'>
  >(() => new Set(DEFAULT_KIND_FILTER));
  const [industryFilter, setIndustryFilter] = useState<Set<string>>(
    () => new Set(DEFAULT_INDUSTRY_FILTER)
  );
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);

  const panelTitleRef = useRef<HTMLHeadingElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const locale: Locale = isSupportedLocale(localeParam) ? localeParam : 'ja';

  useEffect(() => {
    if (!isSupportedLocale(localeParam)) {
      void navigate('/ja', { replace: true });
    }
  }, [localeParam, navigate]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectedNodeId = getNodeIdFromSearch(searchParams);

  const nodesById = useMemo(
    () => new Map(graphContent.nodes.map((node) => [node.id, node])),
    []
  );
  const selectedNode = selectedNodeId
    ? (nodesById.get(selectedNodeId) ?? null)
    : null;

  const filtered = useMemo(
    () =>
      filterGraph({
        content: graphContent,
        // Keep graph topology stable while typing in search.
        query: '',
        kindFilter,
        industryFilter
      }),
    [industryFilter, kindFilter]
  );
  const isSearchActive = query.trim().length > 0;
  const searchMatchedNodeIds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return new Set<string>();
    }
    return new Set(
      filtered.nodes
        .filter((node) => getNodeSearchText(node).includes(normalizedQuery))
        .map((node) => node.id)
    );
  }, [filtered.nodes, query]);
  const listedNodes = useMemo(() => {
    if (!isSearchActive) {
      return filtered.nodes;
    }
    return filtered.nodes.filter((node) => searchMatchedNodeIds.has(node.id));
  }, [filtered.nodes, isSearchActive, searchMatchedNodeIds]);

  const adjacency = useMemo(
    () => createAdjacencyIndex(filtered.edges),
    [filtered.edges]
  );
  const highlightedNodeIds = useMemo(
    () => getHighlightedNodeIds(selectedNode?.id ?? null, adjacency),
    [adjacency, selectedNode?.id]
  );

  useEffect(() => {
    if (selectedNode) {
      lastFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      window.setTimeout(() => panelTitleRef.current?.focus(), 0);
      return;
    }
    lastFocusedRef.current?.focus();
  }, [selectedNode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedNode) {
        setSearchParams(withNodeId(searchParams, null), { replace: true });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchParams, selectedNode, setSearchParams]);

  const selectNode = (nodeId: string) => {
    setSearchParams(withNodeId(searchParams, nodeId), { replace: true });
  };

  const closePanel = () => {
    setSearchParams(withNodeId(searchParams, null), { replace: true });
  };

  const toggleKind = (kind: 'pure_concept' | 'application') => {
    setKindFilter((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) {
        next.delete(kind);
      } else {
        next.add(kind);
      }
      return next.size === 0 ? new Set(DEFAULT_KIND_FILTER) : next;
    });
  };

  const toggleIndustry = (industry: string) => {
    setIndustryFilter((prev) => {
      const next = new Set(prev);
      if (next.has(industry)) {
        next.delete(industry);
      } else {
        next.add(industry);
      }
      return next.size === 0 ? new Set(DEFAULT_INDUSTRY_FILTER) : next;
    });
  };

  const resetFilters = () => {
    setQuery('');
    setKindFilter(new Set(DEFAULT_KIND_FILTER));
    setIndustryFilter(new Set(DEFAULT_INDUSTRY_FILTER));
  };

  const switchLocale = (nextLocale: Locale) => {
    void navigate(`/${nextLocale}?${searchParams.toString()}`);
  };

  const shareUrl = `${window.location.origin}/${locale}?${withNodeId(searchParams, selectedNode?.id ?? null).toString()}`;

  return (
    <div className="bg-app min-h-screen">
      <header className="mx-auto w-full max-w-[1600px] px-4 pt-4 pb-2 lg:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {t('app.title')}
              </h1>
              <p className="text-sm text-slate-600">{t('app.subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchLocale('ja')}
                className={`rounded-lg border px-3 py-1 text-sm ${locale === 'ja' ? 'border-sky-700 bg-sky-50 text-sky-800' : 'border-slate-300 bg-white text-slate-700'}`}
              >
                {t('locale.switchToJa')}
              </button>
              <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`rounded-lg border px-3 py-1 text-sm ${locale === 'en' ? 'border-sky-700 bg-sky-50 text-sky-800' : 'border-slate-300 bg-white text-slate-700'}`}
              >
                {t('locale.switchToEn')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-3 px-4 pb-4 lg:grid-cols-[340px_1fr] lg:px-6">
        <aside className="space-y-3 lg:sticky lg:top-3 lg:h-[calc(100vh-2rem)] lg:overflow-auto">
          <SearchFilters
            query={query}
            onChangeQuery={setQuery}
            kindFilter={kindFilter}
            onToggleKind={toggleKind}
            industryFilter={industryFilter}
            onToggleIndustry={toggleIndustry}
            onReset={resetFilters}
          />
          <Legend />
          <NodeList
            locale={locale}
            nodes={listedNodes}
            selectedNodeId={selectedNode?.id ?? null}
            onSelectNode={selectNode}
          />
        </aside>

        <section className="relative h-[68vh] rounded-2xl border border-slate-200 bg-white/95 shadow-sm lg:h-[calc(100vh-8rem)]">
          <div
            aria-label={t('accessibility.graphRegion')}
            role="region"
            className={`h-full transition-all duration-200 ${selectedNode ? 'lg:pr-[44%]' : ''}`}
          >
            <GraphCanvas
              locale={locale}
              nodes={filtered.nodes}
              edges={filtered.edges}
              selectedNodeId={selectedNode?.id ?? null}
              highlightedNodeIds={highlightedNodeIds}
              searchMatchedNodeIds={searchMatchedNodeIds}
              isSearchActive={isSearchActive}
              onSelectNode={selectNode}
              onBackgroundClick={closePanel}
            />
          </div>

          {selectedNode && (
            <>
              {isMobile && (
                <button
                  type="button"
                  aria-label="Close detail overlay"
                  onClick={closePanel}
                  className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"
                />
              )}
              <div
                data-testid="detail-panel-shell"
                className="fixed inset-x-0 bottom-0 z-30 h-[56vh] overflow-hidden rounded-t-2xl border border-slate-200 bg-white lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:w-[44%] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l"
              >
                <DetailPanel
                  locale={locale}
                  node={selectedNode}
                  allEdges={graphContent.edges}
                  nodesById={nodesById}
                  onClose={closePanel}
                  onSelectNode={selectNode}
                  shareUrl={shareUrl}
                  panelTitleRef={panelTitleRef}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export const App = () => {
  if (contentLoadError) {
    return (
      <ErrorFallback
        title="コンテンツを読み込めませんでした / Failed to load content"
        description="graph-content.json がスキーマ検証に失敗しました。詳細は開発者コンソールを確認してください。 / graph-content.json failed schema validation. See the developer console for details."
        detail={contentLoadError.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n')}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ja" replace />} />
      <Route path="/:locale" element={<AppPage />} />
      <Route path="*" element={<Navigate to="/ja" replace />} />
    </Routes>
  );
};
