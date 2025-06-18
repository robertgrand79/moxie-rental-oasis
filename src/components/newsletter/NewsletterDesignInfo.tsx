
import React from 'react';
import { Eye } from 'lucide-react';

const NewsletterDesignInfo = () => {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg">
          <Eye className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">Enhanced with Moxie Design</h4>
          <p className="text-sm text-gray-600 mt-1">
            Your newsletter includes branded headers, responsive design, property showcases, 
            and professional styling that reflects Moxie's Eugene-focused vacation rental expertise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterDesignInfo;
