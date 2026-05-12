import css from './App.module.css'
import NoteList from '../NoteList/NoteList'
import { fetchNotes, createNote } from '../services/noteService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pagination from '../Pagination/Pagination';
import { useState } from 'react';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import SearchBox from '../SearchBox/SearchBox';
import { useDebouncedCallback } from 'use-debounce';
import { deleteNote } from '../services/noteService';

export default function App() {
  const [page, setPage] = useState<number>(1); 
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', page, searchQuery],
    queryFn: () => fetchNotes(page, searchQuery),
    placeholderData: (previousData) => previousData,
  });

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, 500);

  const mutation = useMutation({
    mutationFn: ({ title, content, tag }: { title: string, content: string, tag: string }) => 
      createNote(title, content, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
    },
  });

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteNote(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  },
  onError: () => {
    alert("Помилка при видаленні нотатки.");
  }
});

const handleDelete = (id: string) => {
  if (window.confirm("Ви впевнені, що хочете видалити цю нотатку?")) {
    deleteMutation.mutate(id);
  }
};


  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 0;

  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  const handleAddNote = (title: string, content: string, tag: string) => {
    mutation.mutate({ title, content, tag });
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={handleSearchChange} />
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <p>Loading notes...</p>}
      {isError && <p>Something went wrong. Please try again later.</p>}
      
      {!isLoading && notes.length > 0 && <NoteList notes={notes} onDelete={handleDelete} />}
      {!isLoading && !isError && notes.length === 0 && <p>No notes found.</p>}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm 
            onSubmit={handleAddNote} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </Modal>
      )}
    </div>
  );
}
