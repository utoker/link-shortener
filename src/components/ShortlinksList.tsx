'use client';

import Link from 'next/link';
import { DeleteButton } from './DeleteButton';
import { useUserContext } from '../app/context/UserContext';

export default function ShortlinksList() {
  const { user, shortlinks, refetchShortlinks } = useUserContext();

  return (
    user && (
      <div className="mt-4 space-y-6">
        <table className="w-full table-auto border border-border bg-background">
          <thead>
            <tr className="bg-secondary">
              <th className="px-4 py-2 text-left text-foreground">Slug</th>
              <th className="px-4 py-2 text-left text-foreground">URL</th>
              <th className="px-4 py-2 text-left text-foreground">Clicks</th>
              <th className="px-4 py-2 text-left text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shortlinks &&
              shortlinks.map((shortlink) => (
                <tr key={shortlink.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/${shortlink.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setTimeout(() => refetchShortlinks(), 200);
                      }}
                    >
                      {shortlink.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{shortlink.url}</td>
                  <td className="px-4 py-2">{shortlink.click_count}</td>
                  <td className="px-4 py-2">
                    <DeleteButton
                      shortlinkId={shortlink.id}
                      onSuccess={refetchShortlinks} // Refresh shortlinks list on success
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )
  );
}
