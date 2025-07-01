import trending$ from "../stores/trending";
import { db } from "./firebase";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";

export function subscribeTrending() {
  const now = Date.now();

  if (now - trending$.lastFetched.get() < 24 * 3600 * 1000) {
    return () => {};
  }

  const q = query(
    collection(db, "trendingProducts"),
    orderBy("fetchedAt", "desc"),
    limit(50)
  );

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      trending$.items.set(items);
      trending$.lastFetched.set(Date.now());
    },
    (err) => console.error("Trending subscription error:", err)
  );

  return unsubscribe;
}
