import { useEffect } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';

/**
 * Async loads platform marketing fonts (Fraunces) for staymoxie.com
 * Uses media="print" + onload swap technique to avoid render-blocking
 */
export const usePlatformFonts = () => {
  const { isPlatformSite } = usePlatform();

  useEffect(() => {
    if (!isPlatformSite) return;

    const loadFont = (fontName: string, weights: string = '400;500;600;700') => {
      const linkId = `platform-font-${fontName.replace(/ /g, '-')}`;
      if (document.getElementById(linkId)) return;

      const link = document.createElement('link');
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:opsz,wght@9..144,${weights}&display=swap`;
      link.rel = 'stylesheet';
      // Non-render-blocking: load as print, swap to all on load
      link.media = 'print';
      link.onload = () => { link.media = 'all'; };
      document.head.appendChild(link);
    };

    // Load Fraunces for platform marketing pages
    loadFont('Fraunces');
  }, [isPlatformSite]);
};

export default usePlatformFonts;
