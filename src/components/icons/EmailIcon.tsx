export default function EmailIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={props.className}
      viewBox="0 0 16 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.800781 3.38773L6.93715 7.47865C7.4596 7.82695 8.14023 7.82695 8.66267 7.47865L14.799 3.38773M2.35615 11.9422H13.2437C14.1027 11.9422 14.799 11.2459 14.799 10.3869V2.61005C14.799 1.75105 14.1027 1.05469 13.2437 1.05469H2.35614C1.49714 1.05469 0.800781 1.75105 0.800781 2.61005V10.3869C0.800781 11.2459 1.49714 11.9422 2.35615 11.9422Z"
        stroke="black"
        strokeOpacity="0.7"
        strokeWidth="0.699913"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
