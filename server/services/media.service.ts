export class MediaService {
    static async getAllMedia(){
        const medias = await $fetch('/api/media')

        return medias
    }
}