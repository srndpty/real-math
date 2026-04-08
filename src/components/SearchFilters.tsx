import { INDUSTRY_CATEGORIES } from '../content/types';
import { INDUSTRY_COLORS } from './graphStyle';
import { useTranslation } from 'react-i18next';

type SearchFiltersProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  kindFilter: Set<'pure_concept' | 'application'>;
  onToggleKind: (kind: 'pure_concept' | 'application') => void;
  industryFilter: Set<string>;
  onToggleIndustry: (industry: string) => void;
  onReset: () => void;
};

export const SearchFilters = ({
  query,
  onChangeQuery,
  kindFilter,
  onToggleKind,
  industryFilter,
  onToggleIndustry,
  onReset
}: SearchFiltersProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-700">
          {t('controls.searchLabel')}
        </span>
        <input
          value={query}
          onChange={(event) => onChangeQuery(event.target.value)}
          placeholder={t('controls.searchPlaceholder')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-inner ring-offset-2 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
        />
      </label>

      <div className="space-y-2">
        <h2 className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
          {t('controls.typeFilter')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleKind('pure_concept')}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              kindFilter.has('pure_concept')
                ? 'border-blue-700 bg-blue-50 text-blue-800'
                : 'border-slate-300 bg-white text-slate-600'
            }`}
          >
            {t('controls.kindConcept')}
          </button>
          <button
            type="button"
            onClick={() => onToggleKind('application')}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              kindFilter.has('application')
                ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                : 'border-slate-300 bg-white text-slate-600'
            }`}
          >
            {t('controls.kindApplication')}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
          {t('controls.industryFilter')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_CATEGORIES.map((industry) => {
            const active = industryFilter.has(industry);
            return (
              <button
                key={industry}
                type="button"
                onClick={() => onToggleIndustry(industry)}
                style={{
                  borderColor: active ? INDUSTRY_COLORS[industry] : '#CBD5E1',
                  backgroundColor: active
                    ? `${INDUSTRY_COLORS[industry]}22`
                    : '#FFFFFF'
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  active ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                {industry}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        {t('controls.reset')}
      </button>
    </section>
  );
};
