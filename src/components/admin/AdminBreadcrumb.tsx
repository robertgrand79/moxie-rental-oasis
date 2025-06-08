
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/properties': 'Properties',
  '/page-management': 'Page Management',
  '/blog-management': 'Blog Management',
  '/admin/analytics': 'Analytics',
  '/admin/chat-support': 'Chat Support',
  '/admin/profile': 'Profile',
  '/site-settings': 'Site Settings',
  '/admin/events': 'Events',
  '/admin/poi': 'Points of Interest',
  '/admin/lifestyle': 'Lifestyle Gallery',
  '/admin/testimonials': 'Testimonials',
  '/admin/ai-tools': 'AI Tools',
};

export function AdminBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = [];
  let currentPath = '';

  // Add home breadcrumb
  breadcrumbs.push({
    label: 'Dashboard',
    path: '/admin',
    isLast: location.pathname === '/admin'
  });

  // Build breadcrumbs from path segments
  if (location.pathname !== '/admin') {
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      if (currentPath !== '/admin') {
        breadcrumbs.push({
          label,
          path: currentPath,
          isLast
        });
      }
    });
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {breadcrumb.isLast ? (
            <span className="text-gray-900 font-medium">{breadcrumb.label}</span>
          ) : (
            <Link 
              to={breadcrumb.path}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
