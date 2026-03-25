import { describe, expect, it } from 'vitest';

import { listings } from './mockData';
import { buildListingFeed, filterListings } from './marketplace.utils';

describe('filterListings', () => {
  it('matches keyword and location across searchable listing fields', () => {
    const results = filterListings(listings, {
      keyword: 'border collie',
      location: 'milano',
      sex: 'all',
      organizationType: 'all',
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('luna-border-collie');
  });
});

describe('buildListingFeed', () => {
  it('inserts a sponsor block after every three listings', () => {
    const feed = buildListingFeed(listings.slice(0, 5));
    const sponsorItems = feed.filter((item) => item.type === 'sponsor');

    expect(sponsorItems).toHaveLength(1);
    expect(feed[3]?.type).toBe('sponsor');
  });
});
