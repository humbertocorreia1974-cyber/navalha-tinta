// jgnext-motion: o template é recriado a cada navegação → animação de entrada em TODA troca de página.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
