import { supabase } from "../../../services/supabaseService";
import { buildEdgeFunctionUrl } from "../../../services/supabase/edgeFunctions";

type DeleteAccountFlowParams = {
  deleteConfirmText: string;
  isTestAccount: boolean;
  onLogout?: () => void;
  setIsDeleting: (value: boolean) => void;
  resetDeleteState: () => void;
  closeDeleteModal: () => void;
};

export async function runDeleteAccountFlow({
  deleteConfirmText,
  isTestAccount,
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
    let {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.access_token) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData.session || !refreshData.session.access_token) {
        alert("Session expired. Please sign in again.");
        resetDeleteState();
        closeDeleteModal();
        setIsDeleting(false);
        if (onLogout) {
          onLogout();
        }
        return;
      }

      session = refreshData.session;
    }

    if (!session || !session.access_token) {
      alert("Authentication error. Please sign in again.");
      resetDeleteState();
      closeDeleteModal();
      setIsDeleting(false);
      if (onLogout) {
        onLogout();
      }
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(session.access_token);

    if (userError || !user) {
      const { data: finalRefresh, error: finalError } = await supabase.auth.refreshSession();

      if (finalError || !finalRefresh.session?.access_token) {
        alert("Session expired. Please sign in again.");
        resetDeleteState();
        closeDeleteModal();
        setIsDeleting(false);
        if (onLogout) {
          onLogout();
        }
        return;
      }

      session = finalRefresh.session;

      const {
        data: { user: validatedUser },
        error: validationError,
      } = await supabase.auth.getUser(session.access_token);

      if (validationError || !validatedUser) {
        alert("Authentication error. Please sign in again.");
        resetDeleteState();
        closeDeleteModal();
        setIsDeleting(false);
        if (onLogout) {
          onLogout();
        }
        return;
      }
    }

    await performDeletionRequest(session.access_token);

    alert(
      "Your account has been permanently deleted. All your data has been removed from our systems."
    );

    await supabase.auth.signOut();
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

async function performDeletionRequest(accessToken: string) {
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
    body: JSON.stringify({}),
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
