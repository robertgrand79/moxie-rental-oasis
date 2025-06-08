
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20 text-center max-w-lg">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">404</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
          <a 
            href="/" 
            className="inline-block bg-gradient-to-r from-gradient-from to-gradient-accent-from text-white px-8 py-3 rounded-full hover:from-gradient-from/90 hover:to-gradient-accent-from/90 transition-all duration-300 shadow-lg"
          >
            Return to Home
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
