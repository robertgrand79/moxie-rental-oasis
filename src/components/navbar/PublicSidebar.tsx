import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { navigationItems } from './navigationItems';
import AuthSection from './AuthSection';
import { useTenant } from '@/contexts/TenantContext';

const PublicSidebar = () => {
  const location = useLocation();
  const { isSingleProperty, tenant } = useTenant();

  // Filter out Admin and Properties (for single property sites) from public navigation
  const publicNavItems = navigationItems.filter(item => {
    if (item.name === 'Admin') return false;
    if ((item.href === '/properties' || item.href === '/listings') && isSingleProperty) {
      return false;
    }
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-4 py-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              {tenant?.name || 'Home'}
            </span>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t">
          <AuthSection />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default PublicSidebar;
