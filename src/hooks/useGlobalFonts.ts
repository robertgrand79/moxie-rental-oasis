import { useEffect } from 'react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

interface FontPairing {
  id: string;
  heading: string;
  body: string;
}

const fontPairings: FontPairing[] = [
  { id: 'playfair-source', heading: 'Playfair Display', body: 'Source Sans Pro' },
  { id: 'montserrat-lora', heading: 'Montserrat', body: 'Lora' },
  { id: 'cormorant-proza', heading: 'Cormorant Garamond', body: 'Proza Libre' },
  { id: 'josefin-open', heading: 'Josefin Sans', body: 'Open Sans' },
  { id: 'cabin-crimson', heading: 'Cabin', body: 'Crimson Text' },
  { id: 'raleway-roboto', heading: 'Raleway', body: 'Roboto' },
  { id: 'dm-serif-dm-sans', heading: 'DM Serif Display', body: 'DM Sans' },
  { id: 'libre-baskerville-source', heading: 'Libre Baskerville', body: 'Source Sans Pro' },
  { id: 'poppins-merriweather', heading: 'Poppins', body: 'Merriweather' },
  { id: 'abril-lato', heading: 'Abril Fatface', body: 'Lato' }
];

interface SizeScale {
  id: string;
  baseSize: string;
  headingScale: string;
  lineHeight: string;
}

const sizeScales: SizeScale[] = [
  { id: 'compact', baseSize: '14px', headingScale: '1.2', lineHeight: '1.5' },
  { id: 'default', baseSize: '16px', headingScale: '1.25', lineHeight: '1.6' },
  { id: 'spacious', baseSize: '18px', headingScale: '1.333', lineHeight: '1.75' }
];

export const useGlobalFonts = () => {
  const { settings, loading } = useSimplifiedSiteSettings();

  useEffect(() => {
    if (loading) return;

    const fontPairingId = settings?.fontPairing || 'playfair-source';
    const fontScaleId = settings?.fontScale || 'default';

    const pairing = fontPairings.find(p => p.id === fontPairingId) || fontPairings[0];
    const scale = sizeScales.find(s => s.id === fontScaleId) || sizeScales[1];

    // Load Google Fonts asynchronously (non-render-blocking)
    const loadFont = (fontName: string) => {
      const linkId = `font-${fontName.replace(/ /g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        // Use media="print" + onload to load fonts asynchronously (non-render-blocking)
        link.media = 'print';
        link.onload = () => { link.media = 'all'; };
        document.head.appendChild(link);
      }
    };

    loadFont(pairing.heading);
    loadFont(pairing.body);

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--font-heading', `"${pairing.heading}", serif`);
    root.style.setProperty('--font-body', `"${pairing.body}", sans-serif`);
    root.style.setProperty('--font-base-size', scale.baseSize);
    root.style.setProperty('--font-heading-scale', scale.headingScale);
    root.style.setProperty('--font-line-height', scale.lineHeight);

    // Calculate heading sizes
    const baseSize = parseInt(scale.baseSize);
    const ratio = parseFloat(scale.headingScale);
    root.style.setProperty('--font-size-h1', `${(baseSize * Math.pow(ratio, 5)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h2', `${(baseSize * Math.pow(ratio, 4)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h3', `${(baseSize * Math.pow(ratio, 3)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h4', `${(baseSize * Math.pow(ratio, 2)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h5', `${(baseSize * Math.pow(ratio, 1)).toFixed(0)}px`);
    root.style.setProperty('--font-size-body', scale.baseSize);

  }, [settings?.fontPairing, settings?.fontScale, loading]);
};

export default useGlobalFonts;
