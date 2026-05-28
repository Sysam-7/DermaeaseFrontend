/**
 * Resolve stored profilePic path for <img src>. Handles /uploads/... and absolute URLs.
 */
export function profileImageUrl(profilePic) {
  if (!profilePic) return null;
  if (/^https?:\/\//i.test(profilePic)) return profilePic;
  const raw = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (raw.startsWith('http')) {
    const origin = raw.replace(/\/api$/i, '');
    const path = profilePic.startsWith('/') ? profilePic : `/${profilePic}`;
    return `${origin}${path}`;
  }
  return profilePic.startsWith('/') ? profilePic : `/${profilePic}`;
}

/**
 * Avatar URL for list/detail/chat UI. Supports:
 * - Full `http(s)://...` URLs
 * - API uploads (`/uploads/profile-images/...`) — resolved to API origin when `VITE_API_URL` is set
 * - Static app images (`/Images/...`) — same-origin, not proxied to API
 * - Legacy bare filenames (`doctor1.jpg`) → `/Images/{doctors|patients}/...`
 * @param {'doctors' | 'patients'} legacyFolder
 */
export function avatarImageUrl(profilePic, legacyFolder = 'doctors') {
  if (!profilePic) return null;
  if (/^https?:\/\//i.test(profilePic)) return profilePic;
  if (profilePic.startsWith('/Images/')) {
    return profilePic.startsWith('/') ? profilePic : `/${profilePic}`;
  }
  if (profilePic.startsWith('/uploads/')) {
    return profileImageUrl(profilePic);
  }
  if (profilePic.startsWith('/')) {
    return profileImageUrl(profilePic);
  }
  return `/Images/${legacyFolder}/${profilePic}`;
}
