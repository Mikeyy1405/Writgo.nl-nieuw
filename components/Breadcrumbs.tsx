import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Helper function to convert hash-based href to full URL for structured data
const toFullUrl = (href: string): string => {
  // Handle hash-based routes (e.g., "#/cursussen" -> "/cursussen")
  if (href.startsWith('#/')) {
    return `https://writgo.nl${href.substring(1)}`;
  }
  // Handle hash-only routes (e.g., "#/" -> "/")
  if (href === '#/') {
    return 'https://writgo.nl/';
  }
  // Handle absolute paths
  if (href.startsWith('/')) {
    return `https://writgo.nl${href}`;
  }
  // Fallback for any other format
  return `https://writgo.nl/${href.replace('#', '')}`;
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <i className="fas fa-chevron-right text-slate-600 text-xs mx-2"></i>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="text-slate-400 hover:text-brand-400 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-white font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
      
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": item.href ? toFullUrl(item.href) : undefined
          }))
        })}
      </script>
    </nav>
  );
};
