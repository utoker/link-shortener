import { withTRPC } from '@trpc/next';
import { AppRouter } from './api/trpc/[trpc]';
import { AppType } from 'next/dist/shared/lib/utils';
import { ChakraProvider } from '@chakra-ui/react';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

// function getBaseUrl() {
// if (process.browser) return ''; // Browser should use current path
// if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
// return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
// }

export default withTRPC<AppRouter>({
  config({ ctx }) {
    // const url = `${getBaseUrl()}/api/trpc`;
    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : 'http://localhost:3000/api/trpc';

    return {
      url,
    };
  },
  ssr: false,
})(MyApp);
