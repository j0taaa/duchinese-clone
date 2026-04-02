function hashString(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return hash >>> 0;
}

function hsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function getStoryArtwork(seed: string) {
  const hash = hashString(seed);
  const baseHue = hash % 360;
  const midHue = (baseHue + 18 + ((hash >> 5) % 28)) % 360;
  const endHue = (baseHue + 42 + ((hash >> 10) % 34)) % 360;
  const saturation = 58 + ((hash >> 15) % 18);
  const startLightness = 84 - ((hash >> 20) % 8);
  const midLightness = 68 - ((hash >> 24) % 10);
  const endLightness = 50 - ((hash >> 12) % 8);

  return {
    surface: `linear-gradient(135deg, ${hsl(baseHue, saturation, startLightness)} 0%, ${hsl(
      midHue,
      saturation + 4,
      midLightness,
    )} 52%, ${hsl(endHue, saturation - 2, endLightness)} 100%)`,
    glow: `linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 100%)`,
  };
}
