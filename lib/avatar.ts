export const DEFAULT_FEMALE_AVATAR = "/avatars/female_default.webp";
export const DEFAULT_MALE_AVATAR = "/avatars/male_default.webp";
export const DEFAULT_NEUTRAL_AVATAR = "/avatars/neutral_default.webp";

/**
 * Normalizes gender string safely to 'female', 'male', or 'neutral'
 */
export function normalizeGender(gender: any): 'female' | 'male' | 'neutral' {
  if (!gender || typeof gender !== 'string') return 'neutral';
  const g = gender.trim().toLowerCase();
  if (g === 'female' || g === 'f' || g === 'girl' || g === 'woman' || g === 'lady') {
    return 'female';
  }
  if (g === 'male' || g === 'm' || g === 'boy' || g === 'man') {
    return 'male';
  }
  return 'neutral';
}

/**
 * Resolves avatar image URL for Admin Panel users, hosts, and verification items.
 * Priority:
 * 1. Valid custom avatar URL (image, avatar, profilePic, photo, imageUrl, etc.)
 * 2. Gender-based default avatar (/avatars/female_default.webp, /avatars/male_default.webp)
 * 3. Neutral default avatar (/avatars/neutral_default.webp)
 */
export function getAdminAvatar(userOrHost: any, fallbackGender?: string): string {
  let customUrl: string | null = null;
  let gender: string | undefined = fallbackGender;

  if (userOrHost && typeof userOrHost === 'object') {
    customUrl =
      userOrHost.image ||
      userOrHost.avatar ||
      userOrHost.profilePic ||
      userOrHost.photo ||
      userOrHost.imageUrl ||
      userOrHost.profileImage ||
      userOrHost.userId?.image ||
      userOrHost.userId?.avatar ||
      userOrHost.sender?.image ||
      userOrHost.user?.image;

    if (!gender) {
      gender =
        userOrHost.gender ||
        userOrHost.sex ||
        userOrHost.userId?.gender ||
        userOrHost.sender?.gender ||
        userOrHost.user?.gender ||
        userOrHost.hostGender;
    }
  } else if (typeof userOrHost === 'string') {
    customUrl = userOrHost;
  }

  // Validate custom URL string
  if (
    customUrl &&
    typeof customUrl === 'string' &&
    customUrl.trim() !== '' &&
    customUrl.trim().toLowerCase() !== 'null' &&
    customUrl.trim().toLowerCase() !== 'undefined' &&
    !customUrl.includes('placeholder.com')
  ) {
    let cleanUrl = customUrl.trim();
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace(/^http:\/\//, 'https://');
    }
    return cleanUrl;
  }

  const normGender = normalizeGender(gender);
  if (normGender === 'female') return DEFAULT_FEMALE_AVATAR;
  if (normGender === 'male') return DEFAULT_MALE_AVATAR;
  return DEFAULT_NEUTRAL_AVATAR;
}
