import { useSession } from "@/components/context/auth-context";
import axios from "axios";
import { useEffect, useState } from "react";

export function useRoadmap() {
  const { session } = useSession();
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token) return;
    axios.get("http://localhost:3001/user/roadmap", {
      headers: { Authorization: `Bearer ${session.token}` }
    })
    .then(res => setRoadmap(res.data.roadmap))
    .finally(() => setLoading(false));
  }, [session]);

  return { roadmap, loading };
} 