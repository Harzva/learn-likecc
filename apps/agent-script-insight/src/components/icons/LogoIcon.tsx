export default function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#b45309" />
      <path
        d="M10 8C10 8 10 24 10 24C10 24 22 24 22 24C22 24 22 20 22 20C22 20 14 20 14 20C14 20 14 16 14 16C14 16 20 16 20 16C20 16 20 12 20 12C20 12 14 12 14 12C14 12 14 8 14 8C14 8 22 8 22 8C22 8 22 4 22 4C22 4 10 4 10 4C10 4 10 8 10 8Z"
        fill="#f5f0ea"
      />
    </svg>
  );
}
