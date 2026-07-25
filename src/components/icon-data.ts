import {
  Dumbbell, Footprints, Bike, Timer, Flame, Repeat,
  Brain, Moon, Bed, Heart, Shield, Clock,
  BookOpen, BookMarked, GraduationCap, Target, ClipboardList, Code,
  Zap, Sparkles, TrendingUp, BarChart3, AlarmClock, FolderOpen,
  Stethoscope, Apple, Salad, Droplets, Coffee, ShowerHead,
  Palette, Paintbrush, Music, Music2, Mic, Guitar, Camera, PenLine, Pencil,
  TreePine, Sunrise, Coins, ShoppingBag, Users, MessageCircle, Dog, Plane,
  Gamepad2, Trash2, Smartphone, ChefHat, Trophy,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell, Footprints, Bike, Timer, Flame, Repeat,
  Brain, Moon, Bed, Heart, Shield, Clock,
  BookOpen, BookMarked, GraduationCap, Target, ClipboardList, Code,
  Zap, Sparkles, TrendingUp, BarChart3, AlarmClock, FolderOpen,
  Stethoscope, Apple, Salad, Droplets, Coffee, ShowerHead,
  Palette, Paintbrush, Music, Music2, Mic, Guitar, Camera, PenLine, Pencil,
  TreePine, Sunrise, Coins, ShoppingBag, Users, MessageCircle, Dog, Plane,
  Gamepad2, Trash2, Smartphone, ChefHat, Trophy,
};

export interface IconEntry {
  key: string;
  label: string;
  component: LucideIcon;
}

export interface IconCategory {
  name: string;
  icons: IconEntry[];
}

const CATEGORY_CONFIG: { name: string; keys: string[] }[] = [
  { name: "Fitness", keys: ["Dumbbell", "Footprints", "Bike", "Timer", "Flame", "Repeat"] },
  { name: "Mindfulness", keys: ["Brain", "Moon", "Bed", "Heart", "Shield", "Clock"] },
  { name: "Learning", keys: ["BookOpen", "BookMarked", "GraduationCap", "Target", "ClipboardList", "Code"] },
  { name: "Productivity", keys: ["Zap", "Sparkles", "TrendingUp", "BarChart3", "AlarmClock", "FolderOpen"] },
  { name: "Health", keys: ["Stethoscope", "Apple", "Salad", "Droplets", "Coffee", "ShowerHead"] },
  { name: "Creative", keys: ["Palette", "Paintbrush", "Music", "Music2", "Mic", "Guitar", "Camera", "PenLine", "Pencil"] },
  { name: "Lifestyle", keys: ["TreePine", "Sunrise", "Coins", "ShoppingBag", "Users", "MessageCircle", "Dog", "Plane", "Gamepad2", "Trash2", "Smartphone", "ChefHat", "Trophy"] },
];

export const ICON_CATEGORIES: IconCategory[] = CATEGORY_CONFIG.map((cat) => ({
  name: cat.name,
  icons: cat.keys.map((key) => ({
    key,
    label: key.replace(/([A-Z])/g, " $1").trim(),
    component: ICON_MAP[key],
  })),
}));
