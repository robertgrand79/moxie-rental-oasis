
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
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
  const isMobile = useIsMobile();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${isMobile ? 'px-3' : ''}`}>
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={isMobile ? 'min-h-[44px]' : ''}
                >
                  <Link to={item.href} className={`flex items-center space-x-3 ${isMobile ? 'px-3 py-3' : ''}`}>
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default AdminSidebarSection;
