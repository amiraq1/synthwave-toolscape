import { useEffect } from 'react';

interface WebsiteSchema {
  type: 'website';
  name: string;
  description: string;
  url: string;
}

interface ToolSchema {
  type: 'software';
  name: string;
  description: string;
  url: string;
  image?: string;
  category: string;
  pricingType: string;
  rating?: number;
  reviewCount?: number;
  faq?: { question: string; answer: string }[];
}

interface ToolListSchema {
  type: 'itemList';
  name: string;
  description: string;
  items: Array<{
    id: string | number;
    name: string;
    url: string;
  }>;
}

type SchemaType = WebsiteSchema | ToolSchema | ToolListSchema;

const SITE_URL = 'https://amiraq.org';

export const useStructuredData = (schema: SchemaType) => {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-structured-data]');
    if (existingScript) {
      existingScript.remove();
    }

    let jsonLd: object;

    switch (schema.type) {
      case 'website':
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: schema.name,
          description: schema.description,
          url: schema.url,
          inLanguage: 'ar',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${schema.url}?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        };
        break;

      case 'software': {
        const softwareSchema = {
          '@type': 'SoftwareApplication',
          // ... software properties
          name: schema.name,
          description: schema.description,
          url: schema.url,
          applicationCategory: mapCategoryToSchema(schema.category),
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: schema.pricingType === 'مجاني' ? '0' : undefined,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          ...(schema.image && { image: schema.image }),
          ...(schema.rating && schema.reviewCount && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: schema.rating,
              reviewCount: schema.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }),
        };

        if (schema.faq && schema.faq.length > 0) {
          jsonLd = {
            '@context': 'https://schema.org',
            '@graph': [
              softwareSchema,
              {
                '@type': 'FAQPage',
                mainEntity: schema.faq.map(item => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                  },
                })),
              },
            ],
          };
        } else {
          jsonLd = {
            '@context': 'https://schema.org',
            ...softwareSchema,
          };
        }
        break;
      }

      case 'itemList':
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: schema.name,
          description: schema.description,
          numberOfItems: schema.items.length,
          itemListElement: schema.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: `${SITE_URL}/tool/${item.id}`,
          })),
        };
        break;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [schema]);
};

function mapCategoryToSchema(category: string): string {
  const categoryMap: Record<string, string> = {
    'نصوص': 'BusinessApplication',
    'صور': 'MultimediaApplication',
    'فيديو': 'MultimediaApplication',
    'برمجة': 'DeveloperApplication',
    'إنتاجية': 'BusinessApplication',
  };
  return categoryMap[category] || 'WebApplication';
}

export default useStructuredData;
