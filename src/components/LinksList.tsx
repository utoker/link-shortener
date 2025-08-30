'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import CreateLinkIcon from '@icons/create-link-icon.svg';
import CopyIcon from '@icons/copy-icon.svg';
import DeleteIcon from '@icons/delete-icon.svg';

import { useUserContext } from '@/app/context/UserContext';
import type { Link } from '@/lib/types/database';
import { deleteLink } from '@/app/actions/data';
import type { DeleteLinkResult } from '@/app/actions/data/deleteLink';

export default function LinksList() {
  const [_isPending, startAction] = useTransition();
  const { user, links, refetchLinks } = useUserContext();

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */
  if (!user || !links) {
    return (
      <div className="text-yellow font-fredoka-one container mx-auto mt-12 pt-8 text-center text-2xl">
        <p>Paste your link and press the</p>
        <div className="bg-yellow mx-auto my-2 h-8 w-8 rounded-full sm:my-4 sm:h-14 sm:w-14">
          <CreateLinkIcon className="mx-auto h-8 w-8 p-1 sm:h-14 sm:w-14 sm:p-2" />
        </div>
        <p>button to make it shorten!</p>
        <p className="text-yellow font-fredoka-one pt-4 text-2xl">
          Log in to see your links.
        </p>
      </div>
    );
  }
  if (links.length === 0) {
    return (
      <div className="text-yellow font-fredoka-one container mx-auto px-4 text-center text-2xl sm:py-16">
        <p>Paste your link and press</p>
        <div className="bg-yellow mx-auto h-8 w-8 rounded-full sm:h-14 sm:w-14">
          <CreateLinkIcon className="mx-auto h-8 w-8 p-1 sm:h-14 sm:w-14 sm:p-2" />
        </div>
        <p>to make it shorten!</p>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Delete handler (uses new FormData signature)                       */
  /* ------------------------------------------------------------------ */
  const handleDelete = (id: string) => {
    startAction(async () => {
      const fd = new FormData();
      fd.append('linkId', id);

      const res: DeleteLinkResult = await deleteLink({ success: false }, fd);

      if (res.success) {
        toast.success('Link deleted.');
        await refetchLinks();
      } else if (res.formError) {
        toast.error(res.formError);
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /* UI — unchanged styling                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="font-fredoka-one mx-auto max-w-sm px-4 sm:max-w-7xl sm:py-32">
      <div className="bg-yellow w-full overflow-hidden rounded-full border-2 border-black">
        <div className="grid grid-cols-[95px_1fr_30px_85px] items-center py-1 pl-2 text-left text-sm text-black sm:grid-cols-[180px_1fr_100px_100px] sm:gap-x-8 sm:py-3 sm:pr-12 sm:pl-6 sm:text-4xl">
          <div>Shortlinks</div>
          <div>Urls</div>
          <div className="text-center">Clicks</div>
          <div className="text-center">Actions</div>
        </div>
      </div>

      {/* {isPending && (
        <div className="text-yellow mt-4 text-center">Loading links...</div>
      )} */}

      {links.map((link: Link) => (
        <div
          key={link.id}
          className="bg-blue hover:bg-blue/80 font-baloo-thambi grid grid-cols-[95px_1fr_30px_85px] items-center rounded-full border-2 border-black px-2 py-0.5 text-left text-xs text-black transition-colors sm:grid-cols-[180px_1fr_100px_100px] sm:gap-x-8 sm:py-3 sm:pr-12 sm:pl-6 sm:text-lg"
        >
          <div className="truncate">
            <a
              href={`https://reqq.cc/${link.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              reqq.cc/{link.slug}
            </a>
          </div>

          <div className="truncate">{link.url}</div>
          <div className="text-center">{link.click_count}</div>

          <div className="flex justify-center pl-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://reqq.cc/${link.slug}`);
                toast.success('Copied shortlink to clipboard!');
              }}
              className="bg-yellow rounded-full border-1 border-black px-1 text-sm text-black shadow-md transition-transform hover:scale-110 hover:cursor-pointer active:scale-90 sm:px-4 sm:py-1.5"
              title="Copy shortlink"
            >
              <CopyIcon className="mx-auto h-4 w-4 sm:h-8 sm:w-8" />
            </button>

            <button
              onClick={() => handleDelete(link.id)}
              className="bg-yellow rounded-full border-1 border-black px-1 text-sm text-black shadow-md transition-transform hover:scale-110 hover:cursor-pointer active:scale-90 sm:px-4 sm:py-1.5"
              title="Delete shortlink"
            >
              <DeleteIcon className="mx-auto h-4 w-4 sm:h-8 sm:w-8" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
