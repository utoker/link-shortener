'use client';

import { Input } from './ui/input';
import { Button } from './ui/button';
import CreateLinkIcon from '@icons/create-link-icon.svg';

interface UrlInputProps {
  urlInput: string;
  setUrlInput: (value: string) => void;
  urlError: string;
  disabled?: boolean;
}

export default function UrlInput({
  urlInput,
  setUrlInput,
  urlError,
  disabled = false,
}: UrlInputProps) {
  return (
    <div className="relative w-[350px] pt-12 sm:mt-20 sm:h-24 sm:w-3xl">
      <Input
        name="url"
        type="text"
        placeholder="Enter Long Link Here"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        className="font-baloo-thambi border-darkblue bg-input flex h-10 w-[330px] rounded-2xl border-[6px] placeholder-gray-400 [box-shadow:0_10px_6px_rgba(0,0,0,0.5)] focus-visible:ring-0 sm:h-20 sm:w-3xl sm:py-5 sm:text-3xl"
        autoFocus
        required
        autoComplete="off"
        disabled={disabled}
      />

      <Button
        type="submit"
        disabled={disabled}
        title="Create Short Link"
        className="border-darkblue bg-yellow hover:bg-yellow absolute left-[310px] z-10 w-10 -translate-y-10 cursor-pointer rounded-full border-4 [box-shadow:0_10px_6px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 hover:brightness-110 disabled:opacity-100 sm:left-[700px] sm:h-24 sm:w-24 sm:-translate-y-22"
      >
        <CreateLinkIcon className="h-6 w-6 shrink-0 sm:h-16 sm:w-16" />
      </Button>
    </div>
  );
}
