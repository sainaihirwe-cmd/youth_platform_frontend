/** Default categories have translated names; admin-created categories fall back to their stored name. */
export function categoryLabel(t, category) {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return t(`categoryNames.${category.slug}`, { defaultValue: category.name });
}

export function locationLabel(t, location) {
  if (!location) return '';
  return t(`locations.${location}`, { defaultValue: location });
}
