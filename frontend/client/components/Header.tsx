import { DarkModeToggle } from './DarkModeToggle';
import { NotificationCenter } from './NotificationCenter';

export function Header() {
  return (
    <header className="header-container sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Spacer for mobile menu button */}
        <div className="w-10 lg:hidden" />
        
        {/* Center - could add breadcrumbs or title here in future */}
        <div className="flex-1 text-center lg:text-left">
          {/* Optional: Add page title here */}
        </div>

        {/* Right - Notifications & Dark Mode Toggle */}
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
