function ClinicMark({ className = 'h-16 w-16' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 6c6 8 10 12 10 20 0 8-4.5 14-10 18-5.5-4-10-10-10-18C22 18 26 14 32 6Z"
        stroke="#1e3a5f"
        strokeWidth="2.4"
        fill="#0d9488"
      />
      <circle cx="32" cy="24" r="4.5" fill="#fff" />
      <path
        d="M32 44v14M24 50h16M20 56h24"
        stroke="#1e3a5f"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18 22c6 4 10 6 14 6s8-2 14-6"
        stroke="#1e3a5f"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 30c6-3 10-4 14-4s8 1 14 4"
        stroke="#1e3a5f"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default ClinicMark
