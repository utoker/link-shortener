import { Button, Image } from '@chakra-ui/react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function LoginBtn() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <Image
          borderRadius="base"
          boxSize="40px"
          src={session.user!.image || 'https://via.placeholder.com/150'}
          fallbackSrc="https://via.placeholder.com/150"
          alt={session.user!.name || 'Profile Image'}
        />
        <Button mx={3} onClick={() => signOut()}>
          Sign out
        </Button>
      </>
    );
  }
  return (
    <Button mx={3} onClick={() => signIn()}>
      Sign in
    </Button>
  );
}
