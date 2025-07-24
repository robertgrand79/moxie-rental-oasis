import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { securityLogger } from '@/utils/securityLogger';
import { AlertTriangle, Shield, Eye, Trash2 } from 'lucide-react';

const SecurityMonitor = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    // Load events from security logger
    const loadEvents = () => {
      const allEvents = securityLogger.getEvents();
      setEvents(allEvents);
    };

    loadEvents();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'auth_failure': return '🔐';
      case 'invalid_input': return '⚠️';
      case 'rate_limit': return '⏱️';
      case 'xss_attempt': return '🚨';
      case 'unauthorized_access': return '🚫';
      default: return '❓';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'auth_failure': return 'destructive';
      case 'invalid_input': return 'secondary';
      case 'rate_limit': return 'default';
      case 'xss_attempt': return 'destructive';
      case 'unauthorized_access': return 'destructive';
      default: return 'default';
    }
  };

  const filteredEvents = selectedType 
    ? events.filter(event => event.type === selectedType)
    : events;

  const eventTypes = Array.from(new Set(events.map(e => e.type)));
  const eventCounts = eventTypes.reduce((acc, type) => {
    acc[type] = events.filter(e => e.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  const clearEvents = () => {
    securityLogger.clearEvents();
    setEvents([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Security Monitor</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearEvents}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Events
        </Button>
      </div>

      {/* Event Type Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType(null)}
        >
          All Events ({events.length})
        </Button>
        {eventTypes.map(type => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
            className="flex items-center gap-1"
          >
            {getEventIcon(type)} {type.replace('_', ' ')} ({eventCounts[type]})
          </Button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                <Eye className="h-8 w-8 mx-auto mb-2" />
                <p>No security events detected</p>
                <p className="text-sm mt-1">This is good news! Your application appears secure.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.slice(-20).reverse().map((event, index) => (
            <Card key={index} className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <CardTitle className="text-base">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                    <Badge variant={getEventColor(event.type) as any}>
                      {event.type}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.userId && (
                    <p className="text-sm">
                      <strong>User:</strong> {event.userId}
                    </p>
                  )}
                  {event.userAgent && (
                    <p className="text-sm">
                      <strong>User Agent:</strong> {event.userAgent.substring(0, 100)}...
                    </p>
                  )}
                  {event.details && (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>Details:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Security Recommendations */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <ul className="space-y-1 text-sm">
            <li>• Monitor for repeated auth failures from the same IP</li>
            <li>• Review XSS attempts and strengthen input validation</li>
            <li>• Implement rate limiting for sensitive endpoints</li>
            <li>• Set up alerts for critical security events</li>
            <li>• Regularly review permission audit logs</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;