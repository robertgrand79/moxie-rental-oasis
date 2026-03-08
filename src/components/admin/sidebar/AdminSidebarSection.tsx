import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MenuItem } from './adminMenuItems';

interface AdminSidebarItemProps {
  item: MenuItem;
}

const AdminSidebarItem = ({ item }: AdminSidebarItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const IconComponent = item.icon;

  const isChildActive = item.children?.some(
    (child) => child.href && location.pathname.startsWith(child.href)
  ) ?? false;

  const isLeafActive = item.href
    ? location.pathname === item.href
    : false;

  const isActive = item.children ? isChildActive : isLeafActive;

  const [isOpen, setIsOpen] = useState(isChildActive);

  const handleLeafClick = (href: string, e: React.MouseEvent) => {
    if (location.pathname === href) {
      e.preventDefault();
      const resetUrl = `${href}?reset=${Date.now()}`;
      navigate(resetUrl, { replace: true });
      setTimeout(() => navigate(href, { replace: true }), 10);
    }
  };

  // ── Collapsible parent item ──────────────────────────────────────────────
  if (item.children && item.children.length > 0) {
    if (isCollapsed) {
      return (
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton isActive={isChildActive} className="justify-center">
                <IconComponent className="h-5 w-5" />
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    }

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isChildActive && !isOpen}
              className="w-full"
            >
              <IconComponent className="h-5 w-5" />
              <span className="font-medium flex-1">{item.title}</span>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200 ml-auto',
                  isOpen && 'rotate-90'
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildItemActive = child.href
                  ? location.pathname === child.href
                  : false;

                return (
                  <SidebarMenuSubItem key={child.href ?? child.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isChildItemActive}
                    >
                      <Link
                        to={child.href!}
                        className="flex items-center gap-2"
                        onClick={(e) => handleLeafClick(child.href!, e)}
                      >
                        <ChildIcon className="h-4 w-4" />
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // ── Simple leaf item ─────────────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild isActive={isActive} className="justify-center">
              <Link
                to={item.href!}
                className="flex items-center justify-center"
                onClick={(e) => handleLeafClick(item.href!, e)}
              >
                <IconComponent className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          to={item.href!}
          className="flex items-center gap-3"
          onClick={(e) => handleLeafClick(item.href!, e)}
        >
          <IconComponent className="h-5 w-5" />
          <span className="font-medium">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default AdminSidebarItem;
