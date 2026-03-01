import React from 'react';

interface LuxStorySectionProps {
  description: string;
  title?: string;
}

const LuxStorySection: React.FC<LuxStorySectionProps> = ({
  description,
  title = 'The Experience',
}) => {
  if (!description) return null;

  // Split description into a lead statement and the rest
  const sentences = description.split(/(?<=\.)\s+/);
  const leadText = sentences.slice(0, 2).join(' ');
  const bodyText = sentences.slice(2).join(' ');

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Overline */}
        <p className="uppercase tracking-widest text-sm text-muted-foreground mb-12">
          {title}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left — bold statement */}
          <div>
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-snug tracking-tight">
              {leadText}
            </p>
          </div>

          {/* Right — detailed description */}
          <div>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-line">
              {bodyText || leadText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LuxStorySection;
