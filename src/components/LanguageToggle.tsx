import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Lang } from '../i18n/translations';

const langOptions: { code: Lang; label: string; flag: string }[] = [
  { code: 'th', label: 'ไทย', flag: 'https://flagcdn.com/w40/th.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'zh', label: '中文', flag: 'https://flagcdn.com/w40/cn.png' },
];

const LanguageToggle = ({ className = '' }: { className?: string }) => {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = langOptions.find(o => o.code === lang) ?? langOptions[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-900/80 border border-cyan-400/40 hover:border-cyan-300 text-white transition-all cursor-pointer select-none backdrop-blur-sm"
      >
        <img src={current.flag} alt={current.code} className="w-5 h-auto rounded-sm" />
        <span>{current.code.toUpperCase()}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-sky-950 border border-cyan-400/40 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-sm">
          {langOptions.map(opt => (
            <button
              key={opt.code}
              onClick={() => { setLang(opt.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-cyan-500/20 ${
                lang === opt.code ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-white'
              }`}
            >
              <img src={opt.flag} alt={opt.code} className="w-5 h-auto rounded-sm" />
              <span>{opt.label}</span>
              {lang === opt.code && <span className="ml-auto text-cyan-300">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
