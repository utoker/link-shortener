'use client';

import CustomLinkIcon from '@/icons/custom-link-icon.svg';
import { Input } from './ui/input';

interface CustomLinkInputProps {
  slugInput: string;
  setSlugInput: (value: string) => void;
  disabled?: boolean;
}

export default function CustomLinkInput({
  slugInput,
  setSlugInput,
  disabled = false,
}: CustomLinkInputProps) {
  return (
    <div className="bg-yellow focus-within:ring-yellow mt-8 flex h-[76px] max-h-8 items-center rounded-full [box-shadow:0_10px_6px_rgba(0,0,0,0.5)] focus-within:ring-2 sm:mt-32 sm:max-h-[86px] sm:max-w-[444px] sm:px-4">
      <CustomLinkIcon className="h-full w-auto shrink-0" />
      <Input
        id="slug"
        name="slug"
        type="text"
        disabled={disabled}
        value={slugInput}
        onChange={(e) => setSlugInput(e.target.value)}
        placeholder="Customize Your Link"
        className="border-darkblue font-baloo-thambi mr-2 h-6 w-full max-w-36 flex-1 rounded-2xl border-2 bg-white text-xs text-gray-700 placeholder-gray-500 focus:outline-none sm:h-full sm:max-h-[62px] sm:max-w-[330px] sm:border-[6px] sm:text-2xl!"
      />
    </div>
  );
}
