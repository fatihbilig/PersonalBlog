import { useEffect, useState } from "react";
import { getToken, onAuthTokenChange } from "./api";

/**
 * sessionStorage SSR'da yok; useSyncExternalStore + getServerSnapshot:null
 * ilk client render'da token'ı kaçırıp admin layout'u sürekli /login'e atıyordu.
 * Önce tarayıcıda okuma bitince `ready` true olur.
 */
export function useAuthToken(): { token: string | null; ready: boolean } {
  const [state, setState] = useState<{ token: string | null; ready: boolean }>({
    token: null,
    ready: false,
  });

  useEffect(() => {
    setState({ token: getToken(), ready: true });
    return onAuthTokenChange(() => {
      setState({ token: getToken(), ready: true });
    });
  }, []);

  return state;
}
