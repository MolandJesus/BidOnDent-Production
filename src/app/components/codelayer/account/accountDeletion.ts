import { buildEdgeFunctionUrl } from "../../../services/supabase/edgeFunctions";

type DeleteAccountFlowParams = {
  deleteConfirmText: string;
  isTestAccount: boolean;
  clerkUserId?: string | null;
  userEmail?: string;
  getClerkToken?: () => Promise<string | null>;
  deleteClerkUser?: () => Promise<void>;
  onLogout?: () => void;
  setIsDeleting: (value: boolean) => void;
  resetDeleteState: () => void;
  closeDeleteModal: () => void;
};

export async function runDeleteAccountFlow({
  deleteConfirmText,
  isTestAccount,
  clerkUserId,
  userEmail,
  getClerkToken,
  deleteClerkUser,
  onLogout,
  setIsDeleting,
  resetDeleteState,
  closeDeleteModal,
}: DeleteAccountFlowParams) {
  if (deleteConfirmText.toLowerCase() !== "delete") {
    alert('Please type "DELETE" to confirm account deletion');
    return;
  }

  if (isTestAccount) {
    alert("This account type cannot be deleted through this method");
    resetDeleteState();
    return;
  }

  setIsDeleting(true);

  try {
    if (!clerkUserId || !getClerkToken || !deleteClerkUser) {
      alert("Account deletion is unavailable until your Clerk session finishes loading.");
      resetDeleteState();
      closeDeleteModal();
      setIsDeleting(false);
      return;
    }

    const accessToken = await getClerkToken();

    if (!accessToken) {
      alert("Authentication error. Please sign in again.");
      resetDeleteState();
      closeDeleteModal();
      setIsDeleting(false);
      if (onLogout) {
        onLogout();
      }
      return;
    }

    await performDeletionRequest(accessToken, {
      clerkUserId,
      email: userEmail,
    });
    await deleteClerkUser();

    alert(
      "Your account has been permanently deleted. All your data has been removed from our systems."
    );

    setIsDeleting(false);
    resetDeleteState();
    closeDeleteModal();

    if (onLogout) {
      onLogout();
    }
  } catch (error) {
    alert(`Error: ${error instanceof Error ? error.message : "Failed to delete account"}`);
    setIsDeleting(false);
    resetDeleteState();
  }
}

async function performDeletionRequest(
  accessToken: string,
  params: { clerkUserId: string; email?: string }
) {
  if (!accessToken || accessToken.length < 20) {
    throw new Error("Invalid access token - too short or empty");
  }

  const deleteUrl = buildEdgeFunctionUrl("/delete-account");

  const response = await fetch(deleteUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { error: responseText };
    }

    throw new Error(
      errorData.error || errorData.message || errorData.details || "Failed to delete account"
    );
  }
}
