import type { Media } from "~~/types"

export const useMedia = () => {
  const selectedMedia = useState<Media | null>('selectedMedia', () => null)
  const selectedKey = useState<string | null>('selectedKey', () => null)

  const selectMedia = (media: Media, key: string) => {
    selectedMedia.value = media
    selectedKey.value = key
  }

  return {
    selectedMedia,
    selectedKey,
    selectMedia,
  }
}
