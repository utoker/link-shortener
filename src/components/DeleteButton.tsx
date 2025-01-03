'use client';

import { deleteShortlink } from '@app/actions/dataActions';
import { Button } from './ui/button';
import { useActionState } from 'react';

interface DeleteButtonProps {
  shortlinkId: string;
  onSuccess?: () => void;
}

export function DeleteButton({ shortlinkId, onSuccess }: DeleteButtonProps) {
  const [_state, formAction, isPending] = useActionState(handleDelete, {
    message: '',
  });
  // todo: show state message
  async function handleDelete() {
    console.log('Delete button clicked. Shortlink ID:', shortlinkId);
    try {
      const result = await deleteShortlink(shortlinkId); // Ensure server action is called
      console.log('Delete result:', result);
      if (onSuccess) onSuccess(); // Trigger onSuccess callback if provided
      return { message: 'Shortlink deleted successfully.' };
    } catch (error: any) {
      console.error('Error deleting shortlink:', error);
      return { message: error.message || 'Failed to delete shortlink.' };
    }
  }

  return (
    <form action={formAction}>
      <Button
        type="submit"
        disabled={isPending}
        className={`rounded bg-error px-4 py-2 text-white hover:bg-error/90 focus:outline-none focus:ring focus:ring-error ${
          isPending ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </Button>
    </form>
  );
}
