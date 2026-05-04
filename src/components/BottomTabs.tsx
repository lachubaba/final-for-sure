import { NavLink } from "react-router-dom";
import { Home, ArrowDownCircle, ArrowUpCircle, Users, BookOpen, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Dash", icon: Home, end: true },
  { to: "/income", label: "In", icon: ArrowDownCircle, end: false },
  { to: "/expense", label: "Out", icon: ArrowUpCircle, end: false },
  { to: "/merchants", label: "Merch", icon: Users, end: false },
  { to: "/udhaar", label: "Udhaar", icon: BookOpen, end: false },
  { to: "/history", label: "Hist", icon: Clock, end: false },
  { to: "/reports", label: "PDFs", icon: FileText, end: false },
];

export function BottomTabs() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t overflow-x-auto">
      <div className="max-w-2xl mx-auto flex min-w-max">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 text-[10px] sm:text-[11px] font-medium transition",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
