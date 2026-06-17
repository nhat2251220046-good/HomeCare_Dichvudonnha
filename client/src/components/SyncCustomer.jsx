import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect } from "react";

export default function SyncCustomer() {
  function useSafeUser() {
    try {
      return useUser();
    } catch (e) {
      try {
        const raw = sessionStorage.getItem("clerkUser") || sessionStorage.getItem("user");
        if (!raw) return { user: null };
        const parsed = JSON.parse(raw);
        return {
          user: {
            id: parsed.id || parsed._id || "dev-user",
            firstName: parsed.firstName || parsed.name?.split(" ")?.[0] || parsed.fullName || "Dev",
            lastName: parsed.lastName || parsed.name?.split(" ")?.slice(1).join(" ") || "",
            fullName: parsed.fullName || parsed.name || `${parsed.firstName || "Dev"} ${parsed.lastName || ""}`.trim(),
            emailAddresses: [{ emailAddress: parsed.email || parsed.primaryEmailAddress?.emailAddress || parsed.emailAddresses?.[0]?.emailAddress || "dev@example.com" }],
            primaryEmailAddress: { emailAddress: parsed.email || parsed.primaryEmailAddress?.emailAddress || "dev@example.com" },
            primaryPhoneNumber: { phoneNumber: parsed.phone || parsed.primaryPhoneNumber?.phoneNumber || "" },
          },
          isSignedIn: true,
        };
      } catch (err) {
        return { user: null };
      }
    }
  }

  const { user } = useSafeUser();

  useEffect(() => {
    if (user) {
      axios
        .post("http://localhost:5000/api/auth/sync", {
          clerkId: user.id,
          name: user.fullName,
          email: user.emailAddresses[0].emailAddress,
          phone: user.primaryPhoneNumber?.phoneNumber,
        })
        .then((res) => {
          if (res.data?.customer?._id) {
            localStorage.setItem("customerId", res.data.customer._id);
          }
        })
        .catch((err) => {
          console.error("Sync customer failed:", err);
        });
    }
  }, [user]);

  return null;
}
