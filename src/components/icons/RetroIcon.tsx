export type RetroIconName =
  | 'projects'
  | 'logs'
  | 'lab'
  | 'papers'
  | 'music'
  | 'art'
  | 'blog'
  | 'secret'
  | 'trash'
  | 'terminal'
  | 'web'
  | 'browser'
  | 'files'
  | 'dashboard'
  | 'contact'
  | 'home'
  | 'memoire'
  | 'folder'
  | 'file';

export interface RetroIconProps {
  name: RetroIconName;
  size?: number;
  className?: string;
  title?: string;
}

/* ── Icon renderers ────────────────────────────────────────────────── */

function ProjectsIcon() {
  return (
    <>
      {/* Tabbed manila folder back panel */}
      <path d="M4 12 L4 40 L44 40 L44 14 L22 14 L18 10 L4 10 Z" strokeWidth={2} />
      {/* Tab fold - darker fill for depth */}
      <path d="M4 10 L18 10 L22 14 L4 14 Z" fill="currentColor" opacity={0.15} />
      {/* Front flap */}
      <path d="M8 18 L40 18 L40 38 L8 38 Z" strokeWidth={1.5} opacity={0.6} />
      {/* Blueprint grid lines horizontal */}
      <line x1="12" y1="24" x2="36" y2="24" strokeWidth={1} opacity={0.35} />
      <line x1="12" y1="28" x2="36" y2="28" strokeWidth={1} opacity={0.35} />
      <line x1="12" y1="32" x2="36" y2="32" strokeWidth={1} opacity={0.35} />
      {/* Blueprint grid lines vertical */}
      <line x1="20" y1="20" x2="20" y2="36" strokeWidth={1} opacity={0.25} />
      <line x1="30" y1="20" x2="30" y2="36" strokeWidth={1} opacity={0.25} />
      {/* Metal clip on tab */}
      <rect x="28" y="6" width="8" height="8" rx={1} strokeWidth={1.5} />
      <line x1="30" y1="8" x2="34" y2="8" strokeWidth={1} opacity={0.5} />
      {/* Screw on clip */}
      <circle cx="32" cy="11" r={0.8} fill="currentColor" opacity={0.4} />
    </>
  );
}

function LogsIcon() {
  return (
    <>
      {/* Book cover */}
      <rect x="6" y="6" width="36" height="36" rx={3} strokeWidth={2} />
      {/* Spine stitching */}
      <line x1="12" y1="6" x2="12" y2="42" strokeWidth={2} opacity={0.5} />
      <circle cx="12" cy="12" r={0.8} fill="currentColor" opacity={0.3} />
      <circle cx="12" cy="20" r={0.8} fill="currentColor" opacity={0.3} />
      <circle cx="12" cy="28" r={0.8} fill="currentColor" opacity={0.3} />
      <circle cx="12" cy="36" r={0.8} fill="currentColor" opacity={0.3} />
      {/* Bookmark ribbon */}
      <path d="M32 6 L32 16 L35 13 L38 16 L38 6" strokeWidth={1.5} opacity={0.6} />
      {/* Ruled writing lines */}
      <line x1="16" y1="14" x2="36" y2="14" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="19" x2="36" y2="19" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="24" x2="30" y2="24" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="29" x2="36" y2="29" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="34" x2="24" y2="34" strokeWidth={1} opacity={0.35} />
      {/* Page edge curves */}
      <path d="M42 10 Q44 12 42 14" strokeWidth={1} opacity={0.35} />
      <path d="M42 14 Q44 16 42 18" strokeWidth={1} opacity={0.35} />
    </>
  );
}

function LabIcon() {
  return (
    <>
      {/* Flask body */}
      <path d="M20 6 L20 18 L8 38 L40 38 L28 18 L28 6 Z" strokeWidth={2} />
      {/* Flask top rim */}
      <line x1="17" y1="6" x2="31" y2="6" strokeWidth={2.5} />
      {/* Liquid level with fill */}
      <path d="M13 30 L35 30 L40 38 L8 38 Z" fill="currentColor" opacity={0.2} />
      <line x1="13" y1="30" x2="35" y2="30" strokeWidth={1.5} />
      {/* Rising bubbles */}
      <circle cx="20" cy="26" r={1.5} opacity={0.5} />
      <circle cx="26" cy="23" r={1} opacity={0.4} />
      <circle cx="22" cy="20" r={1.2} opacity={0.35} />
      <circle cx="28" cy="27" r={0.8} opacity={0.3} />
      {/* Base/stand */}
      <line x1="24" y1="38" x2="24" y2="44" strokeWidth={2} />
      <line x1="18" y1="44" x2="30" y2="44" strokeWidth={2} />
      {/* Measurement tick marks */}
      <line x1="14" y1="33" x2="16" y2="33" strokeWidth={1} opacity={0.3} />
      <line x1="11" y1="36" x2="13" y2="36" strokeWidth={1} opacity={0.3} />
    </>
  );
}

function PapersIcon() {
  return (
    <>
      {/* Back sheet - offset stack */}
      <rect x="10" y="4" width="26" height="34" rx={2} strokeWidth={1.5} opacity={0.4} />
      {/* Middle sheet */}
      <rect x="8" y="6" width="28" height="36" rx={2} strokeWidth={1.5} opacity={0.6} />
      {/* Front sheet with folded corner */}
      <path d="M6 10 L6 42 L36 42 L36 14 L30 10 Z" strokeWidth={2} />
      {/* Folded corner triangle */}
      <path d="M30 10 L30 14 L36 14 Z" fill="currentColor" opacity={0.15} />
      {/* Staple */}
      <rect x="14" y="7" width="4" height="2" rx={0.5} strokeWidth={1} opacity={0.5} />
      {/* Text lines */}
      <line x1="12" y1="20" x2="30" y2="20" strokeWidth={1} opacity={0.35} />
      <line x1="12" y1="24" x2="30" y2="24" strokeWidth={1} opacity={0.35} />
      <line x1="12" y1="28" x2="26" y2="28" strokeWidth={1} opacity={0.35} />
      <line x1="12" y1="32" x2="30" y2="32" strokeWidth={1} opacity={0.35} />
      {/* Red margin line */}
      <line x1="10" y1="16" x2="10" y2="40" strokeWidth={0.8} opacity={0.25} />
    </>
  );
}

function MusicIcon() {
  return (
    <>
      {/* Cassette body */}
      <rect x="4" y="10" width="40" height="28" rx={4} strokeWidth={2} />
      {/* Left reel */}
      <circle cx="17" cy="22" r={6} strokeWidth={1.5} />
      <circle cx="17" cy="22" r={2} strokeWidth={1.5} />
      {/* Right reel */}
      <circle cx="31" cy="22" r={6} strokeWidth={1.5} />
      <circle cx="31" cy="22" r={2} strokeWidth={1.5} />
      {/* Tape window */}
      <rect x="12" y="28" width="24" height="4" rx={1} strokeWidth={1} opacity={0.5} />
      {/* Tape between reels */}
      <path d="M23 16 Q24 12 25 16" strokeWidth={1} opacity={0.35} />
      {/* Corner screws */}
      <circle cx="8" cy="14" r={1} fill="currentColor" opacity={0.4} />
      <circle cx="40" cy="14" r={1} fill="currentColor" opacity={0.4} />
      <circle cx="8" cy="34" r={1} fill="currentColor" opacity={0.4} />
      <circle cx="40" cy="34" r={1} fill="currentColor" opacity={0.4} />
      {/* Label area */}
      <rect x="10" y="12" width="28" height="10" rx={1} strokeWidth={1} opacity={0.3} />
      {/* Reel spokes */}
      <line x1="17" y1="17" x2="17" y2="27" strokeWidth={0.8} opacity={0.25} />
      <line x1="12" y1="22" x2="22" y2="22" strokeWidth={0.8} opacity={0.25} />
      <line x1="31" y1="17" x2="31" y2="27" strokeWidth={0.8} opacity={0.25} />
      <line x1="26" y1="22" x2="36" y2="22" strokeWidth={0.8} opacity={0.25} />
    </>
  );
}

function ArtIcon() {
  return (
    <>
      {/* Palette shape */}
      <path d="M24 6 C10 6 4 16 4 26 C4 36 14 42 24 42 C30 42 36 38 38 32 L32 30 C30 34 28 35 24 35 C14 35 10 30 10 26 C10 16 16 13 24 13 C30 13 36 16 40 14 L40 12 C40 8 24 6 24 6 Z" strokeWidth={2} />
      {/* Paint wells with different opacities for color depth */}
      <circle cx="16" cy="18" r={2.5} fill="currentColor" opacity={0.35} />
      <circle cx="28" cy="16" r={2} fill="currentColor" opacity={0.3} />
      <circle cx="14" cy="26" r={2} fill="currentColor" opacity={0.25} />
      <circle cx="20" cy="14" r={1.8} fill="currentColor" opacity={0.4} />
      <circle cx="10" cy="22" r={1.5} fill="currentColor" opacity={0.2} />
      {/* Thumb hole */}
      <ellipse cx="30" cy="28" rx={4} ry={5} strokeWidth={1.5} />
      {/* Paintbrush handle */}
      <line x1="36" y1="10" x2="44" y2="2" strokeWidth={2} />
      {/* Paintbrush ferrule */}
      <rect x="33" y="7" width="5" height="3" rx={1} strokeWidth={1} opacity={0.5} transform="rotate(-30 35.5 8.5)" />
      {/* Brush bristles */}
      <path d="M32 8 L30 5 L34 4" strokeWidth={1} opacity={0.4} />
    </>
  );
}

function BlogIcon() {
  return (
    <>
      {/* Notepad cover */}
      <rect x="6" y="6" width="32" height="36" rx={3} strokeWidth={2} />
      {/* Spiral holes */}
      <circle cx="12" cy="10" r={1.5} fill="currentColor" opacity={0.4} />
      <circle cx="12" cy="16" r={1.5} fill="currentColor" opacity={0.4} />
      <circle cx="12" cy="22" r={1.5} fill="currentColor" opacity={0.4} />
      <circle cx="12" cy="28" r={1.5} fill="currentColor" opacity={0.4} />
      <circle cx="12" cy="34" r={1.5} fill="currentColor" opacity={0.4} />
      {/* Spiral ring coils */}
      <path d="M9 10 Q12 8 15 10" strokeWidth={1} opacity={0.35} />
      <path d="M9 16 Q12 14 15 16" strokeWidth={1} opacity={0.35} />
      <path d="M9 22 Q12 20 15 22" strokeWidth={1} opacity={0.35} />
      <path d="M9 28 Q12 26 15 28" strokeWidth={1} opacity={0.35} />
      <path d="M9 34 Q12 32 15 34" strokeWidth={1} opacity={0.35} />
      {/* Ruled lines */}
      <line x1="18" y1="12" x2="34" y2="12" strokeWidth={1} opacity={0.35} />
      <line x1="18" y1="17" x2="34" y2="17" strokeWidth={1} opacity={0.35} />
      <line x1="18" y1="22" x2="30" y2="22" strokeWidth={1} opacity={0.35} />
      <line x1="18" y1="27" x2="34" y2="27" strokeWidth={1} opacity={0.35} />
      <line x1="18" y1="32" x2="28" y2="32" strokeWidth={1} opacity={0.35} />
      {/* Pencil body */}
      <line x1="38" y1="6" x2="44" y2="42" strokeWidth={2} />
      {/* Pencil tip */}
      <path d="M37 8 L40 5 L42 7" strokeWidth={1.5} />
    </>
  );
}

function SecretIcon() {
  return (
    <>
      {/* Safe body */}
      <rect x="4" y="10" width="40" height="32" rx={4} strokeWidth={2} />
      {/* Door border */}
      <rect x="8" y="14" width="32" height="24" rx={2} strokeWidth={1.5} opacity={0.5} />
      {/* Keyhole outer circle */}
      <circle cx="24" cy="26" r={4} strokeWidth={1.5} />
      {/* Keyhole inner slot */}
      <rect x="22.5" y="28" width="3" height="6" rx={1} strokeWidth={1.5} />
      {/* Shackle arc */}
      <path d="M16 10 L16 6 C16 2 32 2 32 6 L32 10" strokeWidth={2} />
      {/* Tumbler dial marks */}
      <circle cx="38" cy="26" r={2} strokeWidth={1.5} opacity={0.5} />
      <line x1="38" y1="23" x2="38" y2="24" strokeWidth={1} opacity={0.4} />
      <line x1="38" y1="28" x2="38" y2="29" strokeWidth={1} opacity={0.4} />
      {/* Hinge dots */}
      <circle cx="7" cy="18" r={1} fill="currentColor" opacity={0.35} />
      <circle cx="7" cy="32" r={1} fill="currentColor" opacity={0.35} />
      {/* Corner screws */}
      <circle cx="8" cy="14" r={0.8} fill="currentColor" opacity={0.25} />
      <circle cx="40" cy="14" r={0.8} fill="currentColor" opacity={0.25} />
    </>
  );
}

function TrashIcon() {
  return (
    <>
      {/* Can body */}
      <path d="M10 14 L14 42 L34 42 L38 14 Z" strokeWidth={2} />
      {/* Lid */}
      <path d="M6 14 L42 14" strokeWidth={2.5} />
      {/* Lid handle */}
      <path d="M20 14 L20 10 L28 10 L28 14" strokeWidth={2} />
      {/* Vertical ribs */}
      <line x1="18" y1="18" x2="19" y2="38" strokeWidth={1} opacity={0.35} />
      <line x1="24" y1="18" x2="24" y2="38" strokeWidth={1} opacity={0.35} />
      <line x1="30" y1="18" x2="29" y2="38" strokeWidth={1} opacity={0.35} />
      {/* Crumpled paper peeking */}
      <circle cx="20" cy="10" r={3} strokeWidth={1.5} opacity={0.5} />
      <path d="M18 8 L22 12" strokeWidth={1} opacity={0.4} />
      <path d="M19 7 L21 11" strokeWidth={0.8} opacity={0.3} />
      {/* Side handles */}
      <path d="M7 18 L10 18 L10 22 L7 22" strokeWidth={1.5} opacity={0.5} />
      <path d="M38 18 L41 18 L41 22 L38 22" strokeWidth={1.5} opacity={0.5} />
    </>
  );
}

function TerminalIcon() {
  return (
    <>
      {/* CRT monitor body */}
      <rect x="4" y="4" width="40" height="30" rx={4} strokeWidth={2} />
      {/* Screen with slight fill */}
      <rect x="8" y="8" width="32" height="22" rx={2} strokeWidth={1.5} fill="currentColor" opacity={0.08} />
      {/* Scanlines */}
      <line x1="8" y1="13" x2="40" y2="13" strokeWidth={0.5} opacity={0.2} />
      <line x1="8" y1="18" x2="40" y2="18" strokeWidth={0.5} opacity={0.2} />
      <line x1="8" y1="23" x2="40" y2="23" strokeWidth={0.5} opacity={0.2} />
      {/* >_ prompt caret */}
      <path d="M14 16 L18 20 L14 24" strokeWidth={1.5} />
      <line x1="20" y1="24" x2="26" y2="24" strokeWidth={1.5} />
      {/* Control knobs */}
      <circle cx="34" cy="28" r={1.5} fill="currentColor" opacity={0.4} />
      <circle cx="38" cy="28" r={1.5} fill="currentColor" opacity={0.4} />
      {/* Neck */}
      <path d="M18 34 L18 40 L30 40 L30 34" strokeWidth={2} />
      {/* Stand base */}
      <line x1="14" y1="42" x2="34" y2="42" strokeWidth={2} />
      {/* Power LED */}
      <circle cx="10" cy="32" r={1} fill="currentColor" opacity={0.3} />
    </>
  );
}

function WebIcon() {
  return (
    <>
      {/* Browser window frame */}
      <rect x="4" y="6" width="40" height="36" rx={3} strokeWidth={2} />
      {/* Title bar */}
      <line x1="4" y1="14" x2="44" y2="14" strokeWidth={1.5} />
      {/* Title bar buttons */}
      <circle cx="10" cy="10" r={2} fill="currentColor" opacity={0.3} />
      <circle cx="17" cy="10" r={2} fill="currentColor" opacity={0.3} />
      <circle cx="24" cy="10" r={2} fill="currentColor" opacity={0.3} />
      {/* Globe outer */}
      <ellipse cx="24" cy="28" rx={12} ry={10} strokeWidth={1.5} />
      {/* Globe meridian vertical */}
      <ellipse cx="24" cy="28" rx={5} ry={10} strokeWidth={1} opacity={0.4} />
      {/* Globe equator */}
      <line x1="12" y1="28" x2="36" y2="28" strokeWidth={1} opacity={0.35} />
      {/* Globe latitude lines */}
      <path d="M13 23 Q24 20 35 23" strokeWidth={0.8} opacity={0.3} />
      <path d="M13 33 Q24 36 35 33" strokeWidth={0.8} opacity={0.3} />
    </>
  );
}

function BrowserIcon() {
  return (
    <>
      {/* Window frame */}
      <rect x="4" y="4" width="40" height="38" rx={3} strokeWidth={2} />
      {/* Tab bar */}
      <rect x="8" y="8" width="16" height="6" rx={1} strokeWidth={1.5} />
      <rect x="26" y="8" width="12" height="6" rx={1} strokeWidth={1} opacity={0.4} />
      {/* Navigation bar */}
      <line x1="4" y1="18" x2="44" y2="18" strokeWidth={1.5} />
      {/* Back arrow */}
      <path d="M8 22 L12 19 L12 25" strokeWidth={1.5} />
      {/* Forward arrow */}
      <path d="M14 22 L18 19 L18 25" strokeWidth={1} opacity={0.5} />
      {/* URL bar */}
      <rect x="22" y="20" width="18" height="4" rx={1} strokeWidth={1} opacity={0.4} />
      {/* Page content area */}
      <rect x="8" y="24" width="32" height="14" rx={1} strokeWidth={1} opacity={0.3} />
      {/* Cursor arrow */}
      <path d="M16 28 L16 38 L20 34 L24 38" strokeWidth={1.5} />
      {/* Close/minimize/maximize buttons */}
      <circle cx="10" cy="11" r={1} fill="currentColor" opacity={0.3} />
      <circle cx="14" cy="11" r={1} fill="currentColor" opacity={0.3} />
    </>
  );
}

function FilesIcon() {
  return (
    <>
      {/* Cabinet body */}
      <rect x="6" y="4" width="36" height="40" rx={2} strokeWidth={2} />
      {/* Top drawer */}
      <rect x="10" y="8" width="28" height="14" rx={1} strokeWidth={1.5} />
      {/* Top drawer handle */}
      <rect x="20" y="14" width="8" height="2" rx={1} fill="currentColor" opacity={0.4} />
      {/* Top label plate */}
      <rect x="14" y="10" width="6" height="3" rx={0.5} strokeWidth={1} opacity={0.35} />
      {/* Bottom drawer */}
      <rect x="10" y="26" width="28" height="14" rx={1} strokeWidth={1.5} />
      {/* Bottom drawer handle */}
      <rect x="20" y="32" width="8" height="2" rx={1} fill="currentColor" opacity={0.4} />
      {/* Bottom label plate */}
      <rect x="14" y="28" width="6" height="3" rx={0.5} strokeWidth={1} opacity={0.35} />
      {/* Drawer divider */}
      <line x1="10" y1="22" x2="38" y2="22" strokeWidth={1} opacity={0.35} />
      {/* Feet */}
      <rect x="10" y="44" width="4" height="2" rx={1} fill="currentColor" opacity={0.3} />
      <rect x="34" y="44" width="4" height="2" rx={1} fill="currentColor" opacity={0.3} />
      {/* Top surface line */}
      <line x1="8" y1="6" x2="40" y2="6" strokeWidth={1} opacity={0.25} />
    </>
  );
}

function DashboardIcon() {
  return (
    <>
      {/* Control panel body */}
      <rect x="4" y="6" width="40" height="36" rx={3} strokeWidth={2} />
      {/* Gauge dial */}
      <circle cx="20" cy="22" r={10} strokeWidth={1.5} />
      {/* Gauge needle */}
      <line x1="20" y1="22" x2="26" y2="16" strokeWidth={1.5} />
      {/* Gauge center */}
      <circle cx="20" cy="22" r={2} fill="currentColor" opacity={0.4} />
      {/* Gauge tick marks */}
      <line x1="13" y1="16" x2="15" y2="18" strokeWidth={1} opacity={0.3} />
      <line x1="20" y1="13" x2="20" y2="15" strokeWidth={1} opacity={0.3} />
      <line x1="27" y1="16" x2="25" y2="18" strokeWidth={1} opacity={0.3} />
      <line x1="11" y1="22" x2="13" y2="22" strokeWidth={1} opacity={0.25} />
      <line x1="27" y1="22" x2="29" y2="22" strokeWidth={1} opacity={0.25} />
      {/* Toggle switch 1 */}
      <rect x="34" y="12" width="4" height="8" rx={1} strokeWidth={1.5} />
      <circle cx="36" cy="15" r={1.2} fill="currentColor" opacity={0.5} />
      {/* Toggle switch 2 */}
      <rect x="34" y="26" width="4" height="8" rx={1} strokeWidth={1.5} />
      <circle cx="36" cy="31" r={1.2} fill="currentColor" opacity={0.5} />
      {/* LED indicators */}
      <circle cx="12" cy="36" r={2} fill="currentColor" opacity={0.3} />
      <circle cx="18" cy="36" r={2} fill="currentColor" opacity={0.5} />
      <circle cx="24" cy="36" r={2} fill="currentColor" opacity={0.3} />
    </>
  );
}

function ContactIcon() {
  return (
    <>
      {/* Rolodex card body */}
      <rect x="4" y="6" width="40" height="36" rx={3} strokeWidth={2} />
      {/* Photo box */}
      <rect x="8" y="10" width="12" height="14" rx={1} strokeWidth={1.5} />
      {/* Head silhouette */}
      <circle cx="14" cy="15" r={3} strokeWidth={1} opacity={0.4} />
      {/* Shoulders silhouette */}
      <path d="M9 24 Q14 20 19 24" strokeWidth={1} opacity={0.4} />
      {/* Name line */}
      <line x1="24" y1="12" x2="38" y2="12" strokeWidth={1.5} opacity={0.5} />
      {/* Detail lines */}
      <line x1="24" y1="17" x2="36" y2="17" strokeWidth={1} opacity={0.35} />
      <line x1="24" y1="21" x2="34" y2="21" strokeWidth={1} opacity={0.35} />
      {/* Separator */}
      <line x1="8" y1="28" x2="40" y2="28" strokeWidth={1} opacity={0.3} />
      {/* Stamp corner */}
      <path d="M34 30 L40 30 L40 36" strokeWidth={1} opacity={0.3} strokeDasharray="2 2" />
      {/* Address lines */}
      <line x1="8" y1="32" x2="32" y2="32" strokeWidth={1} opacity={0.35} />
      <line x1="8" y1="36" x2="28" y2="36" strokeWidth={1} opacity={0.35} />
    </>
  );
}

function HomeIcon() {
  return (
    <>
      {/* Pitched roof */}
      <path d="M4 20 L24 6 L44 20" strokeWidth={2} />
      {/* Chimney */}
      <rect x="34" y="8" width="5" height="8" strokeWidth={1.5} />
      {/* Smoke curl */}
      <path d="M36 6 Q37 4 38 6" strokeWidth={1} opacity={0.3} />
      <path d="M35 4 Q36 2 37 4" strokeWidth={0.8} opacity={0.2} />
      {/* House body */}
      <rect x="8" y="20" width="32" height="20" strokeWidth={2} />
      {/* Door */}
      <rect x="20" y="28" width="8" height="12" strokeWidth={1.5} />
      {/* Door knob */}
      <circle cx="26" cy="34" r={1} fill="currentColor" opacity={0.4} />
      {/* 4-pane window */}
      <rect x="12" y="24" width="6" height="6" strokeWidth={1.5} />
      <line x1="15" y1="24" x2="15" y2="30" strokeWidth={1} opacity={0.35} />
      <line x1="12" y1="27" x2="18" y2="27" strokeWidth={1} opacity={0.35} />
      {/* Ground line */}
      <line x1="2" y1="40" x2="46" y2="40" strokeWidth={1.5} opacity={0.4} />
      {/* Pixel corner detail on roof */}
      <path d="M4 20 L6 18" strokeWidth={1} opacity={0.3} />
      <path d="M44 20 L42 18" strokeWidth={1} opacity={0.3} />
    </>
  );
}

function FolderIcon() {
  return (
    <>
      {/* Plain manila folder */}
      <path d="M4 12 L4 40 L44 40 L44 14 L22 14 L18 10 L4 10 Z" strokeWidth={2} />
      {/* Tab fold */}
      <path d="M4 10 L18 10 L22 14 L4 14 Z" fill="currentColor" opacity={0.15} />
      {/* Interior content lines */}
      <line x1="10" y1="22" x2="38" y2="22" strokeWidth={1} opacity={0.35} />
      <line x1="10" y1="28" x2="38" y2="28" strokeWidth={1} opacity={0.35} />
      <line x1="10" y1="34" x2="30" y2="34" strokeWidth={1} opacity={0.35} />
      {/* Subtle edge highlight */}
      <line x1="6" y1="14" x2="6" y2="38" strokeWidth={0.8} opacity={0.2} />
    </>
  );
}

function FileIcon() {
  return (
    <>
      {/* Sheet with folded corner */}
      <path d="M10 4 L30 4 L38 12 L38 44 L10 44 Z" strokeWidth={2} />
      {/* Fold line */}
      <path d="M30 4 L30 12 L38 12" strokeWidth={1.5} />
      {/* Text lines */}
      <line x1="16" y1="18" x2="32" y2="18" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="23" x2="32" y2="23" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="28" x2="28" y2="28" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="33" x2="32" y2="33" strokeWidth={1} opacity={0.35} />
      <line x1="16" y1="38" x2="24" y2="38" strokeWidth={1} opacity={0.35} />
    </>
  );
}

function MemoireIcon() {
  return (
    <>
      {/* Cork board frame */}
      <rect x="6" y="6" width="36" height="36" rx={2} strokeWidth={2} />
      {/* Board inner texture — subtle fill */}
      <rect
        x="8"
        y="8"
        width="32"
        height="32"
        rx={1}
        strokeWidth={0}
        fill="currentColor"
        opacity={0.06}
      />
      {/* Pinned note 1 — top left, slightly tilted */}
      <g transform="rotate(-4 18 16)">
        <rect x="10" y="10" width="14" height="12" rx={1} strokeWidth={1.5} fill="currentColor" opacity={0.2} />
        <line x1="13" y1="14" x2="21" y2="14" strokeWidth={0.8} opacity={0.35} />
        <line x1="13" y1="17" x2="20" y2="17" strokeWidth={0.8} opacity={0.35} />
      </g>
      {/* Thumbtack on note 1 */}
      <circle cx="18" cy="11" r={2} strokeWidth={1.5} fill="currentColor" opacity={0.3} />
      <circle cx="18" cy="11" r={0.8} fill="currentColor" opacity={0.5} />
      {/* Pinned note 2 — right side, slightly tilted */}
      <g transform="rotate(3 33 18)">
        <rect x="26" y="12" width="12" height="10" rx={1} strokeWidth={1.5} fill="currentColor" opacity={0.2} />
        <line x1="29" y1="16" x2="35" y2="16" strokeWidth={0.8} opacity={0.35} />
        <line x1="29" y1="19" x2="34" y2="19" strokeWidth={0.8} opacity={0.35} />
      </g>
      {/* Thumbtack on note 2 */}
      <circle cx="32" cy="13" r={2} strokeWidth={1.5} fill="currentColor" opacity={0.3} />
      <circle cx="32" cy="13" r={0.8} fill="currentColor" opacity={0.5} />
      {/* Index card at bottom — larger, horizontal */}
      <g transform="rotate(-2 24 32)">
        <rect x="12" y="26" width="24" height="12" rx={1} strokeWidth={1.5} fill="currentColor" opacity={0.2} />
        <line x1="15" y1="30" x2="33" y2="30" strokeWidth={0.8} opacity={0.35} />
        <line x1="15" y1="33" x2="30" y2="33" strokeWidth={0.8} opacity={0.35} />
        <line x1="15" y1="36" x2="28" y2="36" strokeWidth={0.8} opacity={0.35} />
      </g>
      {/* Thumbtack on index card */}
      <circle cx="24" cy="27" r={2} strokeWidth={1.5} fill="currentColor" opacity={0.3} />
      <circle cx="24" cy="27" r={0.8} fill="currentColor" opacity={0.5} />
      {/* Corner pin dots on board */}
      <circle cx="9" cy="9" r={0.8} fill="currentColor" opacity={0.3} />
      <circle cx="39" cy="9" r={0.8} fill="currentColor" opacity={0.3} />
      <circle cx="9" cy="39" r={0.8} fill="currentColor" opacity={0.3} />
      <circle cx="39" cy="39" r={0.8} fill="currentColor" opacity={0.3} />
    </>
  );
}

/* ── Registry ──────────────────────────────────────────────────────── */

const ICONS: Record<RetroIconName, () => JSX.Element> = {
  projects: ProjectsIcon,
  logs: LogsIcon,
  lab: LabIcon,
  papers: PapersIcon,
  music: MusicIcon,
  art: ArtIcon,
  blog: BlogIcon,
  secret: SecretIcon,
  trash: TrashIcon,
  terminal: TerminalIcon,
  web: WebIcon,
  browser: BrowserIcon,
  files: FilesIcon,
  dashboard: DashboardIcon,
  contact: ContactIcon,
  home: HomeIcon,
  memoire: MemoireIcon,
  folder: FolderIcon,
  file: FileIcon,
};

/* ── Component ─────────────────────────────────────────────────────── */

export function RetroIcon({
  name,
  size = 40,
  className,
  title,
}: RetroIconProps): JSX.Element {
  const IconContent = ICONS[name] ?? ICONS.folder;
  const hasTitle = title != null && title.length > 0;
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={hasTitle ? undefined : 'true'}
    >
      {hasTitle && <title>{title}</title>}
      <IconContent />
    </svg>
  );
}
