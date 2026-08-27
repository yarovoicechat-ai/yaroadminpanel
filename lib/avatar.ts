export const DEFAULT_FEMALE_AVATAR = "https://res.cloudinary.com/dng9q9u3y/image/upload/v1700000000/default_female_avatar.png";
export const DEFAULT_MALE_AVATAR = "https://res.cloudinary.com/dng9q9u3y/image/upload/v1700000000/default_male_avatar.png";
export const DEFAULT_NEUTRAL_AVATAR = "https://res.cloudinary.com/dng9q9u3y/image/upload/v1700000000/default_neutral_avatar.png";

/**
 * Resolves avatar URL for Admin Panel user / host displays.
 */
export function getAdminAvatar(userOrHost: any, fallbackGender?: string): string {
  const customUrl =
    typeof userOrHost === 'string'
      ? userOrHost
      : userOrHost?.image || userOrHost?.avatar || userOrHost?.profilePic || userOrHost?.photo;

  if (
    customUrl &&
    typeof customUrl === 'string' &&
    customUrl.trim() !== '' &&
    customUrl.trim().toLowerCase() !== 'null' &&
    customUrl.trim().toLowerCase() !== 'undefined'
  ) {
    let cleanUrl = customUrl.trim();
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace(/^http:\/\//, 'https://');
    }
    return cleanUrl;
  }

  const gender = String(
    typeof userOrHost === 'object' ? (userOrHost?.gender || fallbackGender) : fallbackGender || ''
  ).toLowerCase().trim();

  if (gender === 'female' || gender === 'f' || gender === 'woman' || gender === 'girl') {
    return DEFAULT_FEMALE_AVATAR;
  }
  if (gender === 'male' || gender === 'm' || gender === 'man' || gender === 'boy') {
    return DEFAULT_MALE_AVATAR;
  }

  return DEFAULT_NEUTRAL_AVATAR;
}
