'use client';

import { Button } from './ui/button';
import SignUpIcon from '@/icons/signup-icon.svg';

interface SignupButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function SignUpButton({ ...props }: SignupButtonProps) {
  return (
    <Button
      {...props}
      className="bg-yellow hover:bg-yellow/80 h-12 w-32 cursor-pointer rounded-full border-2 border-black px-0 sm:h-24 sm:w-64 sm:border-4"
    >
      <SignUpIcon className="h-9 w-8 shrink-0 sm:h-full sm:w-auto" />
      <div className="font-fredoka-one flex flex-col text-xl leading-5 font-normal text-black sm:text-4xl sm:leading-tight">
        <span>Sign Up</span>
        <span className="mr-4 sm:m-0">free</span>
      </div>
    </Button>
  );
}
