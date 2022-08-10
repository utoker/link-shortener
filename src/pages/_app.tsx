import { AppType } from 'next/dist/shared/lib/utils';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme/theme';
import { SessionProvider } from 'next-auth/react';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
};

export default MyApp;
