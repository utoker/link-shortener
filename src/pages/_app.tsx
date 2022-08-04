import { withTRPC } from '@trpc/next';
import { AppRouter } from './api/trpc/[trpc]';
import { AppType } from 'next/dist/shared/lib/utils';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme/theme';
import { SessionProvider } from 'next-auth/react';

const MyApp: AppType = ({ Component, pageProps }) => {
  console.log(process?.browser, process.env, process.env?.VERCEL_URL);

  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
};

function getBaseUrl() {
  if (process.browser) return ''; // Browser should use current path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = `${getBaseUrl()}/api/trpc`;
    // const url = process.env.VERCEL_URL
    //   ? `https://${process.env.VERCEL_URL}/api/trpc`
    //   : 'http://localhost:3000/api/trpc';
    // const url = 'https://www.reqq.cc/api/trpc';

    return {
      url,
    };
  },
  ssr: false,
})(MyApp);
