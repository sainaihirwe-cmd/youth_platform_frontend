/** Computes a job seeker's profile completion (0-100) and the list of missing items. */
export function seekerProfileCompletion(user) {
  if (!user) return { percent: 0, missing: [] };
  const checks = [
    ['name', Boolean(user.name)],
    ['phone', Boolean(user.phone)],
    ['location', Boolean(user.location)],
    ['profileImage', Boolean(user.profileImage)],
    ['professionalSummary', (user.professionalSummary || '').length >= 30],
    ['skills', (user.skills || []).length >= 3],
    ['education', (user.education || []).length > 0],
    ['experience', (user.experience || []).length > 0],
    ['resume', Boolean(user.resumeUrl)],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([k]) => k),
  };
}

export function employerProfileCompletion(profile, user) {
  if (!profile) return { percent: 0, missing: [] };
  const checks = [
    ['companyName', Boolean(profile.companyName)],
    ['companyLogo', Boolean(profile.companyLogo)],
    ['description', (profile.description || '').length >= 50],
    ['industry', Boolean(profile.industry)],
    ['location', Boolean(profile.location)],
    ['phone', Boolean(profile.phone || user?.phone)],
    ['contactEmail', Boolean(profile.contactEmail)],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([k]) => k),
  };
}
