import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const Icon = ({ size = 16, strokeWidth = 2, children, ...props }: IconProps & { children: React.ReactNode }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
};

export const PumpIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.1} {...props}>
      <path d="M12 3v6M12 21v-6M5 8l7 4 7-4M5 16l7-4 7 4" />
    </Icon>
  );
};

export const CatalogIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={1.9} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 4v16M4 12h5" />
    </Icon>
  );
};

export const HistoryIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={1.9} {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 8v4l3 2" />
    </Icon>
  );
};

export const DocsIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={1.9} {...props}>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-1.5zM19 17H6" />
    </Icon>
  );
};

export const SettingsIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={1.9} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 8.6a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6V4a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 17 5.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21 9.4H21a2 2 0 1 1 0 4h-.1Z" />
    </Icon>
  );
};

export const ChevronDownIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M8 9l4 4 4-4" />
    </Icon>
  );
};

export const LockBadgeIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.4} {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Icon>
  );
};

export const LockIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.1} {...props}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
};

export const SearchIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  );
};

export const MoonIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Icon>
  );
};

export const SunIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </Icon>
  );
};

export const DownloadIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Icon>
  );
};

export const PlusIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
};

export const CloudSyncIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.1} {...props}>
      <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6.5 19z" />
    </Icon>
  );
};

export const ArrowRightIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
};

export const ArrowLeftIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Icon>
  );
};

export const CheckIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={3.2} {...props}>
      <path d="M5 12l5 5 9-10" />
    </Icon>
  );
};

export const ChevronRightThinIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2} stroke="var(--text-faint)" {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
};

export const PlayIcon = (props: IconProps) => {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
};

export const SpinnerIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.4} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Icon>
  );
};

export const PencilIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.1} {...props}>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Icon>
  );
};

export const AlertCircleIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </Icon>
  );
};

export const XIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  );
};

export const DiameterIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  );
};

export const CheckThinIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2.6} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
};

export const LineChartIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={1.8} {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 14l3-4 3 3 5-7" />
    </Icon>
  );
};

export const TrashIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z" />
    </Icon>
  );
};

export const LogoutIcon = (props: IconProps) => {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Icon>
  );
};

export const UserIcon = (props: IconProps) => (
  <Icon strokeWidth={1.9} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
  </Icon>
);

export const BellIcon = (props: IconProps) => (
  <Icon strokeWidth={1.9} {...props}>
    <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Icon>
);

export const HelpCircleIcon = (props: IconProps) => (
  <Icon strokeWidth={1.9} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 1.9v.3" />
    <path d="M12 17.5v.01" />
  </Icon>
);

export const KeyboardIcon = (props: IconProps) => (
  <Icon strokeWidth={1.9} {...props}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
  </Icon>
);
