import { createContext, PropsWithChildren, useContext } from 'react';

export function createRowContext<TContext>() {
  const Context = createContext<TContext | null>(null);
  Context.displayName = 'RowContext';

  return { RowProvider, useRowContext };

  function RowProvider({
    children,
    context,
  }: PropsWithChildren<{ context: TContext }>) {
    return <Context.Provider value={context}>{children}</Context.Provider>;
  }

  function useRowContext() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('应该嵌套在 RowProvider 下');
    }

    return context;
  }
}
