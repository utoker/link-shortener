'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Pencil, QrCode } from 'lucide-react';
import createLinkIcon from '@icons/create-link-icon.webp';
import CopyIcon from '@icons/copy-icon.svg';
import DeleteIcon from '@icons/delete-icon.svg';

import { useUserContext } from '@/app/context/UserContext';
import type { Link } from '@/lib/types/database';
import { deleteLink } from '@/app/actions/data';
import type { DeleteLinkResult } from '@/app/actions/data/deleteLink';

// Loaded the first time a QR code is opened.
const QrCodeDialog = dynamic(() => import('./QrCodeDialog'), { ssr: false });
const EditLinkDialog = dynamic(() => import('./EditLinkDialog'), {
  ssr: false,
});
const DeleteLinkDialog = dynamic(() => import('./DeleteLinkDialog'), {
  ssr: false,
});

export default function LinksList() {
  const [_isPending, startAction] = useTransition();
  // the slug stays set while the dialog closes, so its text doesn't flicker
  const [qr, setQr] = useState<{ slug: string; open: boolean } | null>(null);
  // a new key per opening starts the edit dialog from the saved URL
  const [edit, setEdit] = useState<{
    link: Link;
    open: boolean;
    key: number;
  } | null>(null);
  // the link whose delete button was pressed, until the user confirms
  const [del, setDel] = useState<{ link: Link; open: boolean } | null>(null);
  const { user, links, refetchLinks } = useUserContext();

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */
  if (!user || !links) {
    return (
      <div className="text-yellow font-fredoka-one container mx-auto mt-12 pt-8 text-center text-2xl">
        <p>Paste your link and press the</p>
        <div className="bg-yellow mx-auto my-2 h-8 w-8 rounded-full sm:my-4 sm:h-14 sm:w-14">
          <Image
            src={createLinkIcon}
            alt=""
            unoptimized
            className="mx-auto h-8 w-8 p-1 sm:h-14 sm:w-14 sm:p-2"
          />
        </div>
        <p>button to shorten it!</p>
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
          <Image
            src={createLinkIcon}
            alt=""
            unoptimized
            className="mx-auto h-8 w-8 p-1 sm:h-14 sm:w-14 sm:p-2"
          />
        </div>
        <p>to shorten it!</p>
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
    // Phones: the same 80 px gap as the signed-out text above, so messages
    // under the form (e.g. "Ready: reqq.cc/…") don't cover the first rows.
    <div className="font-fredoka-one mx-auto mt-20 max-w-sm px-4 sm:mt-0 sm:max-w-7xl sm:py-32">
      <div className="bg-yellow w-full overflow-hidden rounded-full border-2 border-black">
        <div className="grid grid-cols-[95px_1fr_30px_85px] items-center py-1 pl-2 text-left text-sm text-black sm:grid-cols-[180px_1fr_100px_220px] sm:gap-x-8 sm:py-3 sm:pr-12 sm:pl-6 sm:text-4xl">
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
          className="bg-blue hover:bg-blue/80 font-baloo-thambi grid grid-cols-[95px_1fr_30px_85px] items-center rounded-full border-2 border-black px-2 py-0.5 text-left text-xs text-black transition-colors sm:grid-cols-[180px_1fr_100px_220px] sm:gap-x-8 sm:py-3 sm:pr-12 sm:pl-6 sm:text-lg"
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

          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <button
              onClick={() => setEdit({ link, open: true, key: Date.now() })}
              className="shrink-0 rounded-full transition-transform hover:scale-110 hover:cursor-pointer active:scale-90"
              aria-label={`Edit where reqq.cc/${link.slug} leads`}
            >
              <Pencil className="h-3 w-3 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
            {/* Google Safe Browsing flagged it; the edit dialog explains */}
            {link.safety_threats && (
              <span className="shrink-0 rounded-full bg-red-500 px-1 sm:px-4">
                Blocked
              </span>
            )}
            <span className="truncate">{link.url}</span>
          </div>
          <div className="text-center">
            <a
              href={`/links/${link.slug}/stats`}
              className="underline underline-offset-2"
              aria-label={`Stats for reqq.cc/${link.slug}: ${link.click_count} clicks`}
            >
              {link.click_count}
            </a>
          </div>

          <div className="flex justify-center pl-1 sm:pl-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://reqq.cc/${link.slug}`);
                toast.success('Copied shortlink to clipboard!');
              }}
              className="bg-yellow rounded-full border-1 border-black px-1 text-sm text-black shadow-md transition-transform hover:scale-110 hover:cursor-pointer active:scale-90 sm:px-4 sm:py-1.5"
              aria-label="Copy shortlink"
            >
              <CopyIcon className="mx-auto h-4 w-4 sm:h-8 sm:w-8" />
            </button>

            <button
              onClick={() => setQr({ slug: link.slug, open: true })}
              className="bg-yellow rounded-full border-1 border-black px-1 text-sm text-black shadow-md transition-transform hover:scale-110 hover:cursor-pointer active:scale-90 sm:px-4 sm:py-1.5"
              aria-label="Show QR code"
            >
              <QrCode className="mx-auto h-4 w-4 sm:h-8 sm:w-8" />
            </button>

            <button
              onClick={() => setDel({ link, open: true })}
              className="bg-yellow rounded-full border-1 border-black px-1 text-sm text-black shadow-md transition-transform hover:scale-110 hover:cursor-pointer active:scale-90 sm:px-4 sm:py-1.5"
              aria-label="Delete shortlink"
            >
              <DeleteIcon className="mx-auto h-4 w-4 sm:h-8 sm:w-8" />
            </button>
          </div>
        </div>
      ))}

      {edit && (
        <EditLinkDialog
          key={edit.key}
          link={edit.link}
          open={edit.open}
          onOpenChange={(open) => setEdit({ ...edit, open })}
          onSaved={refetchLinks}
        />
      )}

      {del && (
        <DeleteLinkDialog
          slug={del.link.slug}
          open={del.open}
          onOpenChange={(open) => setDel({ ...del, open })}
          onConfirm={() => handleDelete(del.link.id)}
        />
      )}

      {qr && (
        <QrCodeDialog
          slug={qr.slug}
          open={qr.open}
          onOpenChange={(open) => setQr({ ...qr, open })}
        />
      )}
    </div>
  );
}
