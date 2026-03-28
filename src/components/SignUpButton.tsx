'use client';

import { Button } from './ui/button';
import SignUpIcon from '@/icons/signup-icon.svg';

interface SignupButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function SignUpButton({ ...props }: SignupButtonProps) {
  return (
    <Button
      {...props}
      className="bg-yellow hover:bg-yellow/80 h-10 w-28 cursor-pointer rounded-full border border-black px-0 sm:h-14 sm:w-44 sm:border-2"
    >
      <SignUpIcon className="h-6 w-6 shrink-0 sm:h-8 sm:w-8" />
      <div className="font-fredoka-one flex flex-col text-[14px] leading-4 font-normal text-black sm:text-2xl sm:leading-6">
        <span>Sign Up</span>
        <span className="mr-2 sm:m-0">free</span>
      </div>
    </Button>
  );
}
