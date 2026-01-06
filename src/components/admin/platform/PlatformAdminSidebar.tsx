import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { platformNavItems, getSectionItems, dashboardNavItem } from './platformNavItems';
import { usePlatformPreferences } from '@/hooks/usePlatformPreferences';

interface PlatformAdminSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const PlatformAdminSidebar = ({ collapsed, onCollapsedChange }: PlatformAdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { isStarred, toggleStarSection } = usePlatformPreferences();

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === 'collapsed';

  const renderNavItem = (item: typeof dashboardNavItem, showStar = true) => {
    const active = isActive(item.path);
    const starred = isStarred(item.key);

    return (
      <SidebarMenuItem key={item.key}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                'group relative',
                active && 'bg-primary/10 text-primary font-medium'
              )}
            >
              <button
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 w-full"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {showStar && (
                      <Star
                        className={cn(
                          'h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
                          starred && 'opacity-100 fill-amber-400 text-amber-400'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarSection(item.key);
                        }}
                      />
                    )}
                  </>
                )}
              </button>
            </SidebarMenuButton>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  const sections = [
    { key: 'core', label: 'Core' },
    { key: 'content', label: 'Content & Support' },
    { key: 'system', label: 'System' },
    { key: 'development', label: 'Development' },
  ] as const;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50"
    >
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <div>
                <h2 className="font-semibold text-sm">Platform</h2>
                <p className="text-xs text-muted-foreground">Command Center</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard Link */}
        <SidebarGroup>
          <SidebarMenu>
            {renderNavItem(dashboardNavItem, false)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Grouped Sections */}
        {sections.map((section) => (
          <SidebarGroup key={section.key}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {getSectionItems(section.key).map((item) => renderNavItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground text-center">
            Platform Admin v1.0
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default PlatformAdminSidebar;
