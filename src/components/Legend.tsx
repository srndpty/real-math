import { useTranslation } from 'react-i18next';

export const Legend = () => {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        {t('legend.title')}
      </h2>
      <ul className="space-y-2 text-xs text-slate-700">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-blue-900 bg-blue-700" />
          {t('legend.nodeConcept')}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 border border-slate-900 bg-emerald-500" />
          {t('legend.nodeApplication')}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-8 bg-slate-500" />
          {t('legend.edgeConcept')}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-8 bg-teal-700" />
          {t('legend.edgeApplication')}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-8 border-t-2 border-dashed border-slate-600" />
          {t('legend.edgePrerequisite')}
        </li>
      </ul>
    </section>
  );
};
