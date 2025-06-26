import { useSession } from "@/components/context/auth-context";
import axios from "axios";
import { useEffect, useState } from "react";

export function useCommunity() {
  const { session } = useSession();
  const [temas, setTemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3001/community/temas", {
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {}
    })
    .then(res => setTemas(res.data.temas))
    .finally(() => setLoading(false));
  }, [session]);

  return { temas, loading };
} 