
import React from 'react';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import UserProfileForm from '@/components/UserProfileForm';

const AdminProfile = () => {
  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              User Profile
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Manage your account information and security settings.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <UserProfileForm />
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default AdminProfile;
