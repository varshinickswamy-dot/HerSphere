import { useEffect } from "react";
import { toast } from "sonner";

export function NetworkStatus() {
  useEffect(() => {
    const offline = () => toast.error("You’re offline", { description: "Check your connection. Your changes may not have been saved." });
    const online = () => toast.success("Connection restored", { description: "You’re back online." });
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);
  return null;
}