import { forwardRef } from "react";
import {
  HugeiconsIcon,
  type HugeiconsProps,
  type IconSvgElement,
} from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  BarChartIcon,
  Bookmark01Icon,
  Cancel01Icon,
  CatIcon,
  ChevronDownIcon,
  ChevronRightIcon as HugeChevronRightIcon,
  ChevronUpIcon,
  CircleIcon as HugeCircleIcon,
  ComputerIcon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  File01Icon,
  FloppyDiskIcon,
  Folder01Icon,
  FolderTreeIcon,
  Github01Icon,
  GlobeIcon,
  HandIcon,
  Heading01Icon,
  HeartIcon,
  HistoryIcon,
  Home09Icon,
  Image01Icon,
  JusticeScale01Icon,
  LeftToRightListBulletIcon,
  Link02Icon,
  MinusSignIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  MoveIcon,
  Note01Icon,
  PanelLeftIcon,
  ParagraphIcon,
  PencilRulerIcon,
  PlusSignCircleIcon,
  PlusSignIcon,
  QuoteUpIcon,
  SecurityCheckIcon,
  Settings01Icon,
  CircleSlash2Icon,
  SmileIcon,
  SourceCodeIcon,
  SparklesIcon,
  Sun01Icon,
  TableIcon as HugeTableIcon,
  TextBoldIcon,
  TextFontIcon,
  Tick02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

/**
 * Compatibility layer over HugeIcons (stroke-rounded, free set).
 *
 * Each export is a drop-in replacement for the previously used `lucide-react`
 * component: it accepts the same props (`className`, `size`, ...) and forwards a
 * ref, so existing call sites — including data structures that store an icon as
 * a component and render `<Icon className="..." />` — keep working unchanged.
 *
 * To swap the glyph for a given name, change the mapping below in one place.
 */

export type IconProps = Omit<HugeiconsProps, "icon" | "altIcon">;

export type IconType = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

/** Kept for backwards compatibility with the previous `LucideIcon` type usage. */
export type LucideIcon = IconType;

function createIcon(icon: IconSvgElement, name: string): IconType {
  const Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <HugeiconsIcon ref={ref} icon={icon} {...props} />
  ));
  Icon.displayName = name;
  return Icon;
}

export const ArrowLeft = createIcon(ArrowLeft01Icon, "ArrowLeft");
export const BarChart2 = createIcon(BarChartIcon, "BarChart2");
export const Bold = createIcon(TextBoldIcon, "Bold");
export const BookMarked = createIcon(Bookmark01Icon, "BookMarked");
export const Cat = createIcon(CatIcon, "Cat");
export const Check = createIcon(Tick02Icon, "Check");
export const CheckIcon = createIcon(Tick02Icon, "CheckIcon");
export const ChevronDown = createIcon(ChevronDownIcon, "ChevronDown");
export const ChevronRight = createIcon(HugeChevronRightIcon, "ChevronRight");
export const ChevronRightIcon = createIcon(HugeChevronRightIcon, "ChevronRightIcon");
export const ChevronUp = createIcon(ChevronUpIcon, "ChevronUp");
export const CircleIcon = createIcon(HugeCircleIcon, "CircleIcon");
export const Code2 = createIcon(SourceCodeIcon, "Code2");
export const Copy = createIcon(Copy01Icon, "Copy");
export const Download = createIcon(Download01Icon, "Download");
export const Edit3 = createIcon(Edit02Icon, "Edit3");
export const File = createIcon(File01Icon, "File");
export const FileText = createIcon(Note01Icon, "FileText");
export const Folder = createIcon(Folder01Icon, "Folder");
export const FolderTree = createIcon(FolderTreeIcon, "FolderTree");
export const Github = createIcon(Github01Icon, "Github");
export const Globe = createIcon(GlobeIcon, "Globe");
export const Hand = createIcon(HandIcon, "Hand");
export const Heading1 = createIcon(Heading01Icon, "Heading1");
export const Heart = createIcon(HeartIcon, "Heart");
export const History = createIcon(HistoryIcon, "History");
export const Home = createIcon(Home09Icon, "Home");
export const Image = createIcon(Image01Icon, "Image");
export const Link2 = createIcon(Link02Icon, "Link2");
export const List = createIcon(LeftToRightListBulletIcon, "List");
export const Minus = createIcon(MinusSignIcon, "Minus");
export const Monitor = createIcon(ComputerIcon, "Monitor");
export const Moon = createIcon(Moon02Icon, "Moon");
export const MoreHorizontal = createIcon(MoreHorizontalIcon, "MoreHorizontal");
export const Move = createIcon(MoveIcon, "Move");
export const PanelLeft = createIcon(PanelLeftIcon, "PanelLeft");
export const PencilRuler = createIcon(PencilRulerIcon, "PencilRuler");
export const Pilcrow = createIcon(ParagraphIcon, "Pilcrow");
export const Plus = createIcon(PlusSignIcon, "Plus");
export const PlusCircle = createIcon(PlusSignCircleIcon, "PlusCircle");
export const Quote = createIcon(QuoteUpIcon, "Quote");
export const Save = createIcon(FloppyDiskIcon, "Save");
export const Scale = createIcon(JusticeScale01Icon, "Scale");
export const Settings = createIcon(Settings01Icon, "Settings");
export const ShieldCheck = createIcon(SecurityCheckIcon, "ShieldCheck");
export const Slash = createIcon(CircleSlash2Icon, "Slash");
export const Smile = createIcon(SmileIcon, "Smile");
export const Sparkles = createIcon(SparklesIcon, "Sparkles");
export const Sun = createIcon(Sun01Icon, "Sun");
export const Table = createIcon(HugeTableIcon, "Table");
export const TableIcon = createIcon(HugeTableIcon, "TableIcon");
export const Trash2 = createIcon(Delete02Icon, "Trash2");
export const Type = createIcon(TextFontIcon, "Type");
export const Upload = createIcon(Upload01Icon, "Upload");
export const X = createIcon(Cancel01Icon, "X");
