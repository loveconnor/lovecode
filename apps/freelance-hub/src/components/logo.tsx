export function Logo({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Heart logo"
    >
      <path
        fill="currentColor"
        d="M12 21.35c-.32 0-.63-.1-.9-.3C6.55 17.54 3 14.36 3 9.86 3 7 5.02 5 7.5 5c1.54 0 3.04.81 3.87 2.07.83-1.26 2.33-2.07 3.87-2.07C18.98 5 21 7 21 9.86c0 4.5-3.55 7.68-8.1 11.19-.27.2-.58.3-.9.3Z"
      />
    </svg>
  );
}
