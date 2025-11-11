"use client";

interface DevtoolsButtonProps {
  onToggle: () => void;
  eventCount: number;
  hasNewEvents: boolean;
  className?: string;
}

export function DevtoolsButton({
  onToggle,
  eventCount,
  hasNewEvents,
  className = "",
}: DevtoolsButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`ai-devtools-button ${hasNewEvents ? "receiving-events" : ""} ${className}`}
      title={`ai-devtools [${eventCount}]`}
    >
      {/* Heart Logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className="ai-devtools-button-icon"
      >
        <title>Heart Logo</title>
        <path
          fill="currentColor"
          d="M12 21.35c-.32 0-.63-.1-.9-.3C6.55 17.54 3 14.36 3 9.86 3 7 5.02 5 7.5 5c1.54 0 3.04.81 3.87 2.07.83-1.26 2.33-2.07 3.87-2.07C18.98 5 21 7 21 9.86c0 4.5-3.55 7.68-8.1 11.19-.27.2-.58.3-.9.3Z"
        />
      </svg>
    </button>
  );
}
