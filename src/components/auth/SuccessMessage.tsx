// components/auth/SuccessMessage.tsx
interface SuccessMessageProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessMessage({ 
  title = "Success!", 
  message, 
  actionLabel, 
  onAction 
}: SuccessMessageProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}