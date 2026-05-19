import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import css from './NoteForm.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '../../services/noteService';

const NoteSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Занадто короткий заголовок!')
    .max(50, 'Занадто довгий заголовок!')
    .required("Це поле обов'язкове"),
  content: Yup.string()
    .max(500, 'Опис занадто довгий'),
   tag: Yup.string()
    .oneOf(['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'])
    .required("Виберіть тег"),
});

interface NoteFormProps {
  onCancel: () => void;
}

export default function NoteForm({ onCancel }: NoteFormProps) {
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ title, content, tag }: { title: string; content: string; tag: string }) => 
      createNote(title, content, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      onCancel();
    },
  });

  return (
    <Formik
      initialValues={{ title: '', content: '', tag: 'Todo' }}
      validationSchema={NoteSchema}
      onSubmit={(values , { resetForm }) => {
        mutation.mutate({
          title: values.title,
          content: values.content || '',
          tag: values.tag,
        });
        resetForm();
      }}
    >
      {({ errors, touched }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field 
              id="title" 
              name="title" 
              className={`${css.input} ${errors.title && touched.title ? css.inputError : ''}`} 
            />
            <ErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              id="content"
              name="content"
              as="textarea"
              rows={8}
              className={`${css.textarea} ${errors.content && touched.content ? css.inputError : ''}`}
            />
            <ErrorMessage name="content" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field id="tag" name="tag" as="select" className={css.select}>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button type="button" className={css.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={mutation.isPending }
            >
              {mutation.isPending  ? 'Creating...' : 'Create note'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
