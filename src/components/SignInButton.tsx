'use client';

import { Button } from './ui/button';
import SignInIcon from '@/icons/signin-icon.svg';
interface SigninButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function SignInButton({ ...props }: SigninButtonProps) {
  return (
    <>
      <Button
        {...props}
        className="h-12 w-32 cursor-pointer rounded-full border-2 border-black bg-white hover:bg-white/80 sm:h-20 sm:w-56 sm:border-4"
      >
        <SignInIcon className="h-9 w-8 shrink-0 sm:mr-4 sm:h-full sm:w-auto" />
        <span className="font-fredoka-one text-xl font-normal text-black sm:text-4xl">
          Sign In
        </span>
      </Button>
    </>
  );
}
