import { MapPin, ShoppingCart, Package, Briefcase, Users, Heart, Info, MessageSquare, Video, GraduationCap } from "lucide-react";

export interface ServiceDefinition {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export interface ServiceDefinitions {
  [key: string]: ServiceDefinition;
}

export const serviceDefinitions: ServiceDefinitions = {
  item_locator: {
    title: "Item Locator",
    description: "Smart inventory location tracking system for retail environments",
    icon: MapPin,
    category: "Core Service"
  },
  easy_checkout: {
    title: "Easy Checkout",
    // description: "Streamlined checkout process with cart management and billing",
    description: "",
    icon: ShoppingCart,
    category: "Core Service"
  },
  catalog: {
    title: "Catalog",
    description: "Comprehensive product catalog management system",
    icon: Package,
    category: "Core Service"
  },
  recruitment: {
    title: "Recruitment",
    description: "Job posting and candidate management platform",
    icon: Briefcase,
    category: "Core Service"
  },
  queue_manager: {
    title: "Queue",
    description: "Efficient customer queue management system",
    icon: Users,
    category: "Core Service"
  },
  donation: {
    title: "Donation",
    description: "Donation management and tracking system",
    icon: Heart,
    category: "Core Service"
  },
  about_us: {
    title: "About Us",
    description: "Business information and profile management system",
    icon: Info,
    category: "Core Service"
  },
  zensevagpt: {
    title: "Zensevagpt",
    description: "AI-powered assistant for business operations",
    icon: MessageSquare,
    category: "Core Service"
  },
  live_streaming: {
    title: "Live Streaming",
    description: "Content streaming and broadcasting platform",
    icon: Video,
    category: "Core Service"
  },
  adaptive_learning: {
    title: "Adaptive Learning",
    description: "A personalized education system that dynamically adjusts learning content and pace based on individual learner performance and progress analytics",
    icon: GraduationCap,
    category: "Core Service"
  },
  loyalty_and_discount: {
    title: "Loyalty and discount",
    description: "",
    icon: GraduationCap,
    category: "Core Service"
  }
}; 