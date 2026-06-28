// Maps a profile location string to the closest local channel slug.
// Checked in order of specificity (OC before LA, etc.).
export function getLocalChannelSlug(location: string): string {
  const loc = location.toLowerCase();

  // Orange County — check before LA so Irvine doesn't match "la" substring
  if (/irvine|anaheim|santa ana|costa mesa|newport|orange county|huntington beach|fullerton|garden grove/.test(loc))
    return 'local-oc';

  // Greater LA
  if (/los angeles|burbank|culver city|long beach|pasadena|silver lake|east la|compton|inglewood|glendale|west hollywood|santa monica|venice|north hollywood/.test(loc))
    return 'local-la';

  // NYC Metro
  if (/new york|brooklyn|queens|manhattan|bronx|jersey city|hoboken|newark/.test(loc))
    return 'local-nyc';

  // SF Bay
  if (/san francisco|oakland|berkeley|san jose|bay area|fremont|richmond/.test(loc))
    return 'local-sf';

  if (/chicago/.test(loc)) return 'local-chicago';
  if (/austin/.test(loc)) return 'local-austin';
  if (/atlanta/.test(loc)) return 'local-atlanta';
  if (/seattle/.test(loc)) return 'local-seattle';
  if (/portland/.test(loc)) return 'local-portland';
  if (/miami|fort lauderdale|boca raton/.test(loc)) return 'local-miami';
  if (/nashville/.test(loc)) return 'local-nashville';
  if (/denver|boulder/.test(loc)) return 'local-denver';
  if (/london/.test(loc)) return 'local-london';
  if (/toronto/.test(loc)) return 'local-toronto';

  return 'local-other';
}
