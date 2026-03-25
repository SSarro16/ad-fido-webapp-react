import type { Listing, ListingFeedItem, ListingFilters } from '../../types/marketplace';

export function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('it-IT');
}

export function filterListings(listings: Listing[], filters: ListingFilters) {
  const keyword = normalizeText(filters.keyword);
  const location = normalizeText(filters.location);

  return listings.filter((listing) => {
    const searchableText = normalizeText(
      [
        listing.name,
        listing.breed,
        listing.city,
        listing.region,
        listing.organizationName,
        listing.organizationType,
        listing.color,
        listing.excerpt,
      ].join(' ')
    );

    const matchesKeyword = !keyword || searchableText.includes(keyword);
    const matchesLocation =
      !location || normalizeText(`${listing.city} ${listing.region}`).includes(location);
    const matchesSex = filters.sex === 'all' || listing.sex === filters.sex;
    const matchesOrganization =
      filters.organizationType === 'all' || listing.organizationType === filters.organizationType;

    return matchesKeyword && matchesLocation && matchesSex && matchesOrganization;
  });
}

export function buildListingFeed(listings: Listing[]): ListingFeedItem[] {
  return listings.flatMap((listing, index) => {
    const items: ListingFeedItem[] = [{ type: 'listing', listing }];
    const shouldInsertSponsor = (index + 1) % 3 === 0 && index !== listings.length - 1;

    if (shouldInsertSponsor) {
      items.push({
        type: 'sponsor',
        sponsorId: `sponsor-${index + 1}`,
        title: 'Spazio sponsor premium',
        body: 'Visibilita dedicata per allevamenti e rifugi verificati, senza interrompere la ricerca.',
      });
    }

    return items;
  });
}
