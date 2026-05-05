import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setClerkTokenGetter } from "@/lib/api";

export function useClerkAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);
}
