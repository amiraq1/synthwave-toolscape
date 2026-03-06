import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/hooks/useAuth";

const OWNER_EMAILS = (import.meta.env.VITE_OWNER_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const useOwnerCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();

  const normalizedEmail = user?.email?.trim().toLowerCase() || "";
  const ownerEmailsConfigured = OWNER_EMAILS.length > 0;
  const isOwner =
    isAdmin &&
    (!ownerEmailsConfigured || OWNER_EMAILS.includes(normalizedEmail));

  return {
    isOwner,
    loading: authLoading || adminLoading,
    ownerEmailsConfigured,
  };
};
