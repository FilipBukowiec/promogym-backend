import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Page } from './page.model';
import { Story } from './story.model';

@Injectable()
export class FacebookService {
  private GRAPH_URL = 'https://graph.facebook.com/v24.0';

  constructor(private readonly httpService: HttpService) {}

  async getPages(userToken: string): Promise<Page[]> {
    const url = `${this.GRAPH_URL}/me/accounts`;
    try {
      return await lastValueFrom(
        this.httpService
          .get(url, {
            params: {
              access_token: userToken,
            fields: 'id,name,access_token,category,link',
            },
          })
          .pipe(
            map((res) => {
              const pagesArray: any[] = res.data.data || [];
              if (!Array.isArray(pagesArray) || pagesArray.length === 0)
                return [];
              return pagesArray.map((page: any) => ({
                id: page.id,
                name: page.name,
                page_token: page.access_token,
                category: page.category,
                link: page.link,
              })) as Page[];
            }),
            catchError(() => {
              throw new HttpException(
                'Błąd pobierania kont FB.',
                HttpStatus.UNAUTHORIZED,
              );
            }),
          ),
      );
    } catch (error) {
      throw error;
    }
  }

 async getStories(pageToken: string, pageId: string): Promise<Story[]> {
    try {
      // 1. POBRANIE LISTY STORIES (METADANE)
      // 💡 Poprawka 1: Dodano 'fields' do params, aby uzyskać media_id i media_type
      const storiesRes = await lastValueFrom(
        this.httpService.get(`${this.GRAPH_URL}/${pageId}/stories`, {
          params: { 
            access_token: pageToken, 
            status: 'PUBLISHED',
            // --- POPRAWKA 1: ŻĄDANIE NIEZBĘDNYCH PÓL ---
            fields: 'id,media_id,media_type,post_id'
          },
        }),
      );
      
      const stories = storiesRes.data.data;
      if (!stories || stories.length === 0) {
        return [];
      }

      // Finalna tablica, która będzie zawierała KAŻDY ELEMENT multimedialny z osobna
      const storiesWithMedia: Story[] = [];

      // 2. ITERACJA SEKWEKNCYJNA i WZBOGACANIE DANYCH
      for (const story of stories) {
        if (!story.media_id) {
          // Teraz ten komunikat powinien pojawiać się rzadziej, po dodaniu fields w Kroku 1
          console.warn(`Story ${story.post_id} nie ma media_id, pomijam.`);
          continue; 
        }

        try {
          
          // --- POPRAWKA 2: DYNAMICZNE USTAWIANIE PÓL W ZALEŻNOŚCI OD TYPU ---
          let fieldsToRequest = '';

          if (story.media_type === 'video') {
              fieldsToRequest = 'source'; // Wideo ma 'source'
          } else if (story.media_type === 'photo') {
              fieldsToRequest = 'images'; // Zdjęcie ma 'images'
          } else {
              // Pomijamy nieznane/nieobsługiwane typy
              console.warn(`Nieobsługiwany typ multimedium: ${story.media_type}`);
              continue; 
          }
          
          // Pobierz szczegóły multimedium (adres URL pliku)
          const mediaRes = await lastValueFrom(
            this.httpService.get(`${this.GRAPH_URL}/${story.media_id}`, {
              params: { 
                fields: fieldsToRequest, // Używamy zmiennej określonej powyżej
                access_token: pageToken 
              },
            }),
          );
          
          const mediaData = mediaRes.data;

          if (story.media_type === 'video') {
            // A. WIDEO
            if (mediaData.source) {
              storiesWithMedia.push({
                mediaType: 'video',
                mediaUrl: mediaData.source,
              });
            }
          } else if (story.media_type === 'photo') {
            // B. ZDJĘCIE
            if (mediaData.images && mediaData.images.length > 0) {
              
              // Wybieramy największy/najmniej skompresowany obraz (zazwyczaj ostatni wariant w tablicy)
              const bestImage = mediaData.images[mediaData.images.length - 1]; 
              
              if (bestImage.source) {
                storiesWithMedia.push({
                  mediaType: 'photo',
                  mediaUrl: bestImage.source,
                });
              }
            }
          }

        } catch (mediaErr) {
          // Błąd dla pojedynczego Story - logujemy i kontynuujemy pętlę
          console.error(
            `Błąd pobierania mediów dla Story ${story.media_id}:`,
            mediaErr.response?.data || mediaErr.message,
          );
        }
      }

      return storiesWithMedia;

    } catch (e) {
      // Obsługa błędów, jeśli główne zapytanie (/stories) zawiedzie
      console.error('Błąd w getStories (Główne zapytanie):', e.response?.data || e.message);
      
      throw new InternalServerErrorException(
        'Nie udało się pobrać Stories z Facebooka.',
      );
    }
}
}