import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SinglePropertySocialSectionProps {
  instagramUrl?: string;
  tiktokUrl?: string;
}

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.15a8.16 8.16 0 005.58 2.17v-3.45a4.85 4.85 0 01-1.59-.27 4.83 4.83 0 01-1.41-.97V6.69h3z"/>
  </svg>
);

const SinglePropertySocialSection: React.FC<SinglePropertySocialSectionProps> = ({ instagramUrl, tiktokUrl }) => {
  if (!instagramUrl && !tiktokUrl) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Follow Our Adventures</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stay connected and see the latest from our property on social media
            </p>
          </div>
          
          <div className={`grid gap-6 ${instagramUrl && tiktokUrl ? 'md:grid-cols-2' : 'max-w-lg mx-auto'}`}>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/10 via-purple-500/10 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                        <InstagramIcon />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Instagram</h3>
                        <p className="text-sm text-muted-foreground">Photos & Stories</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Discover stunning photos, behind-the-scenes moments, and guest experiences on our Instagram.
                    </p>
                    <Button variant="outline" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Follow Us <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </a>
            )}

            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/10 via-pink-500/10 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-black text-white">
                        <TikTokIcon />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">TikTok</h3>
                        <p className="text-sm text-muted-foreground">Videos & Tours</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Watch fun property tours, local tips, and travel inspiration on our TikTok.
                    </p>
                    <Button variant="outline" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Follow Us <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinglePropertySocialSection;
