"use client";

import { AppState, AppStateActions, AppStore, createAppStore } from "@/lib/store";
import { PropsWithChildren, createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

export const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children, ...props }: PropsWithChildren<Partial<AppState>>) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = createAppStore(props);
  }
  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
}

export function useStoreContext<T>(selector: (state: AppState & AppStateActions) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Missing StoreContext.Provider in the tree");
  return useStore(store, selector);
}

// export const useStoreHydration = () => {
//   const [hydrated, setHydrated] = useState(false);
//   const store = useContext(StoreContext);
//   if (!store) throw new Error("Missing StoreContext.Provider in the tree");

//   useEffect(() => {
//     // Note: This is just in case you want to take into account manual rehydration.
//     // You can remove the following line if you don't need it.
//     const unsubHydrate = store.persist.onHydrate(() => setHydrated(false));

//     const unsubFinishHydration = store.persist.onFinishHydration(() => setHydrated(true));

//     setHydrated(store.persist.hasHydrated());

//     return () => {
//       unsubHydrate();
//       unsubFinishHydration();
//     };
//   }, []);

//   return hydrated;
// };
