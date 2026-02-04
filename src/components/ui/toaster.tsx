import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

// Icon mapping based on variant
const toastIcons = {
  default: <Info className="h-5 w-5 text-primary shrink-0" />,
  destructive: <AlertCircle className="h-5 w-5 shrink-0" />,
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Get icon based on variant or title content
        let icon = toastIcons[variant as keyof typeof toastIcons] || toastIcons.default;

        // Auto-detect success toasts based on title
        if (!variant && title && typeof title === 'string') {
          const lowerTitle = title.toLowerCase();
          if (lowerTitle.includes('success') || lowerTitle.includes('created') || lowerTitle.includes('saved') || lowerTitle.includes('updated') || lowerTitle.includes('deleted')) {
            icon = toastIcons.success;
          } else if (lowerTitle.includes('error') || lowerTitle.includes('failed')) {
            icon = toastIcons.destructive;
          } else if (lowerTitle.includes('warning')) {
            icon = toastIcons.warning;
          }
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {icon}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
