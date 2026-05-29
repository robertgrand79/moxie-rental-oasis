import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronDown, ChevronRight } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

type MenuItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

interface AdminSidebarSectionProps {
  title: string;
  items: MenuItem[];
}

const AdminSidebarSection = ({ title, items }: AdminSidebarSectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { state, setOpenMobile } = useSidebar();
  
  const isCollapsed = isMobile ? false : state === 'collapsed';
  
  const hasActiveItem = items.some(item => location.pathname === item.href);
  const [isOpen, setIsOpen] = useState(() => {
    if (!isMobile) return true;
    return title === 'Overview' || hasActiveItem;
  });

  const handleItemClick = (item: MenuItem, event: React.MouseEvent) => {
    const isActive = location.pathname === item.href;
    
    if (isMobile) {
      setOpenMobile(false);
    }
    
    // If clicking the same active menu item, force a navigation reset
    if (isActive) {
      event.preventDefault();
      // Add a timestamp to force a route change and component remount
      const resetUrl = `${item.href}?reset=${Date.now()}`;
      navigate(resetUrl, { replace: true });
      // Immediately navigate back to clean URL to maintain clean history
      setTimeout(() => {
        navigate(item.href, { replace: true });
      }, 10);
    }
  };

  return (
    <SidebarGroup className={isMobile ? "border-b border-border/50 pb-2" : ""}>
      {!isCollapsed && (
        <SidebarGroupLabel 
          onClick={isMobile ? () => setIsOpen(!isOpen) : undefined}
          className={cn(
            "text-xs font-semibold text-gray-500 uppercase tracking-wider select-none",
            isMobile && "px-3 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md active:bg-muted"
          )}
        >
          <span>{title}</span>
          {isMobile && (
            isOpen ? <ChevronDown className="h-4.5 w-4.5 text-gray-400" /> : <ChevronRight className="h-4.5 w-4.5 text-gray-400" />
          )}
        </SidebarGroupLabel>
      )}
      {isOpen && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <SidebarMenuItem key={item.href}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className="justify-center"
                        >
                          <Link 
                            to={item.href} 
                            className="flex items-center justify-center"
                            onClick={(e) => handleItemClick(item, e)}
                          >
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={isMobile ? 'min-h-[44px]' : ''}
                    >
                      <Link 
                        to={item.href} 
                        className={`flex items-center space-x-3 ${isMobile ? 'px-3 py-3' : ''}`}
                        onClick={(e) => handleItemClick(item, e)}
                      >
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};

export default AdminSidebarSection;
