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
        className="h-10 w-28 cursor-pointer rounded-full border border-black bg-white hover:bg-white/80 sm:h-14 sm:w-44 sm:border-2"
      >
        <SignInIcon className="h-6 w-6 shrink-0 sm:mr-2 sm:h-8 sm:w-8" />
        <span className="font-fredoka-one text-[14px] font-normal text-black sm:text-2xl">
          Sign In
        </span>
      </Button>
    </>
  );
}
