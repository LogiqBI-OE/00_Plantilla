/**
 * PageTitleProvider — coordina el titulo del Topbar.
 *
 * Las pages llaman usePageTitle('Mi titulo') al montar; el Topbar
 * lee usePageTitleValue() y lo renderiza.
 *
 * Importante (gotcha #7 SKELETON_GUIDE): document.title NO se setea
 * desde aqui — eso es responsabilidad de BrandProvider que lo arma
 * como `${brand.marca} . ${brand.alcance}`. Este provider solo
 * controla el h1 visual del Topbar.
 */
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

interface PageTitleContextValue {
  title: string;
  setTitle: (t: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(undefined);

export function PageTitleProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [title, setTitle] = useState('');
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

/** Setea el titulo desde una page. Se limpia automaticamente al unmount. */
export function usePageTitle(title: string): void {
  const ctx = useContext(PageTitleContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setTitle(title);
    return () => ctx.setTitle('');
  }, [ctx, title]);
}

/** Lee el titulo actual (usado por Topbar). */
export function usePageTitleValue(): string {
  const ctx = useContext(PageTitleContext);
  return ctx?.title ?? '';
}
