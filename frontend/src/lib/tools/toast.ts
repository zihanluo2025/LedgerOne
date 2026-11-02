import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/api";

export function toastSuccess(msg: string, title = "Submission Successful") {
  toast({
    title,
    description: msg,
    variant: "success",
  });
}

export function toastError(msg: string, title = "Connection Failed") {
  toast({
    title,
    description: msg,
    variant: "error",
  });
}

// Shows the server-provided reason for a failed API call.
export function toastApiError(error: unknown, title = "Action Failed") {
  toastError(getErrorMessage(error), title);
}

export function toastWarning(msg: string) {
  toast({
    title: "Warning",
    description: msg,
    variant: "warning",
  });
}

export function toastInfo(msg: string) {
  toast({
    title: "System Update",
    description: msg,
    variant: "info",
  });
}
