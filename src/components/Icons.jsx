/* 작은 SVG 아이콘 모음 (이모지 대신 사용) */
const I = ({ children, ...p }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{children}</svg>
);
export const Home = (p) => <I {...p}><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" /></I>;
export const Users = (p) => <I {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.5a5 5 0 0 1 5.5 5.5" /></I>;
export const Cloud = (p) => <I {...p}><path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z" /></I>;
export const Laptop = (p) => <I {...p}><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2 19h20" /></I>;
export const Sparkle = (p) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M6.5 17.5 9 15M15 9l2.5-2.5" /></I>;
export const Grid = (p) => <I {...p}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></I>;
export const Shield = (p) => <I {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></I>;
export const External = (p) => <I {...p}><path d="M14 4h6v6M20 4l-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></I>;
export const Search = (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></I>;
export const ChevronLeft = (p) => <I {...p}><path d="m14 6-6 6 6 6" /></I>;
export const ChevronRight = (p) => <I {...p}><path d="m10 6 6 6-6 6" /></I>;
export const ChevronDown = (p) => <I {...p}><path d="m6 9 6 6 6-6" /></I>;
export const Logout = (p) => <I {...p}><path d="M10 4H5v16h5M14 16l4-4-4-4M18 12H9" /></I>;
export const Alert = (p) => <I {...p}><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></I>;
export const Info = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></I>;
export const Sheet = (p) => <I {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></I>;
export const Refresh = (p) => <I {...p}><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></I>;
export const Download = (p) => <I {...p}><path d="M12 4v11M7 10l5 5 5-5M4 20h16" /></I>;
export const Plus = (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
export const Pencil = (p) => <I {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></I>;
export const Trash = (p) => <I {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></I>;
export const Check = (p) => <I {...p}><path d="m5 12 5 5 9-10" /></I>;
/* 카테고리 아이콘 타일용 */
export const Wifi = (p) => <I {...p}><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M12 20h.01" /></I>;
export const Printer = (p) => <I {...p}><path d="M6 9V4h12v5" /><rect x="4" y="9" width="16" height="8" rx="1" /><path d="M6 17v4h12v-4" /></I>;
export const Wrench = (p) => <I {...p}><path d="M21 3 15 9l-2-2 6-6" /><path d="m14 10-9 9a2 2 0 0 1-3-3l9-9" /><path d="m18 6 2 2" /></I>;
export const Tv = (p) => <I {...p}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></I>;
export const UserPlus = (p) => <I {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M18 8v6M15 11h6" /></I>;
export const Tablet = (p) => <I {...p}><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M11 18h2" /></I>;
export const BatteryCharging = (p) => <I {...p}><rect x="6" y="3" width="12" height="18" rx="2" /><path d="m11 8-2 4h3l-1 4 3-5h-2z" /></I>;
export const Cable = (p) => <I {...p}><path d="M9 7V4M15 7V4M7 7h10v4a5 5 0 0 1-10 0z" /><path d="M12 16v4M9 20h6" /></I>;
export const Receipt = (p) => <I {...p}><path d="M7 3h10v18l-2-1.5L13 21l-1.5-1.5L10 21l-2-1.5L7 21z" /><path d="M9 8h6M9 12h6" /></I>;
export const Dots = (p) => <I {...p}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></I>;
export const Archive = (p) => <I {...p}><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></I>;
export const IdCard = (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M7 16.5a2.5 2.5 0 0 1 4 0" /><path d="M14 10h4M14 14h4" /></I>;
export const Paperclip = (p) => <I {...p}><path d="m21 11.5-8.6 8.6a5 5 0 0 1-7.1-7.1l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8.3-8.3" /></I>;
export const Menu = (p) => <I {...p}><path d="M4 7h16M4 12h16M4 17h16" /></I>;
export const Close = (p) => <I {...p}><path d="M6 6l12 12M18 6 6 18" /></I>;
export const Calendar = (p) => <I {...p}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M8 2.5v4M16 2.5v4M3 9.5h18" /></I>;
