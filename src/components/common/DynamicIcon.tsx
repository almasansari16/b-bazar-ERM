import {
  Headphones, Smartphone, Laptop, Shirt, Sparkles, Sofa, ShoppingBasket, HeartPulse, Dumbbell, Baby, Car, BookOpen, Refrigerator, Gem, PawPrint,
  Watch, Speaker, BatteryCharging, Keyboard, Mouse, Tv, Camera, Gamepad2, Tablet, Monitor, HardDrive, Router, Footprints, ShoppingBag, Droplet,
  Droplets, Flower2, SprayCan, Lamp, CookingPot, BedDouble, Archive, Clock, Wheat, Coffee, Candy, Soup, Activity, Bike, Trophy, ToyBrick, Backpack,
  Palette, Lightbulb, Wrench, Book, GraduationCap, Library, PenTool, Microwave, Fan, WashingMachine, Glasses, Wallet, Fish, Bone, Cat, Dog, Pill,
  Thermometer, Scale, Zap, ShieldCheck, Package, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  Headphones, Smartphone, Laptop, Shirt, Sparkles, Sofa, ShoppingBasket, HeartPulse, Dumbbell, Baby, Car, BookOpen, Refrigerator, Gem, PawPrint,
  Watch, Speaker, BatteryCharging, Keyboard, Mouse, Tv, Camera, Gamepad2, Tablet, Monitor, HardDrive, Router, Footprints, ShoppingBag, Droplet,
  Droplets, Flower2, SprayCan, Lamp, CookingPot, BedDouble, Archive, Clock, Wheat, Coffee, Candy, Soup, Activity, Bike, Trophy, ToyBrick, Backpack,
  Palette, Lightbulb, Wrench, Book, GraduationCap, Library, PenTool, Microwave, Fan, WashingMachine, Glasses, Wallet, Fish, Bone, Cat, Dog, Pill,
  Thermometer, Scale, Zap, ShieldCheck, Package,
};
export const ICON_NAMES = Object.keys(MAP);
export function DynamicIcon({ name, className, strokeWidth }: { name: string; className?: string; strokeWidth?: number }) {
  const I = MAP[name] ?? Package;
  return <I className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
