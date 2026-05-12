import axios from "axios";
import type { Note } from '../types/note';

export interface NotesResponse {
  notes: Note[];
  totalPages: number;
  page: number;
  perPage: number;
}

const myKey = import.meta.env.VITE_NOTEHUB_TOKEN;

const api = axios.create({
  baseURL: 'https://notehub-public.goit.study/api',
  headers: {
    'Authorization': `Bearer ${myKey}`
  }
});

export const fetchNotes = async (page: number = 1, searchQuery?: string): Promise<NotesResponse> => {
  const response = await api.get<NotesResponse>('/notes', {
    params: {
      page,
      perPage: 12,
      ...(searchQuery?.trim() && { search: searchQuery.trim() }),
    },
  });
     console.log('Дані з сервера (fetchNotes):', response.data);
    return response.data;
};

export const createNote = async (newTitle: string, newContent: string, newTag: string) => {
  const response = await api.post('/notes', {
    title: newTitle,
    content: newContent,
    tag: newTag
  });
  console.log('Дані з сервера (createNote):', response.data);
  return response.data;
};

export const deleteNote = async (id: number | string) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};