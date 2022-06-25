import { Container, Heading } from '@chakra-ui/react';
import Head from 'next/head';

const Header = () => {
  return (
    <Container centerContent>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Reqq Link Shortener" />
        <meta name="author" content="Umut Toker" />
        <meta name="author" content="suxlike" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="twitter:title" content="Reqq Link Shortener" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@utoker0" />
        <meta name="twitter:creator" content="@utoker0" />
        <meta property="og:site_name" content="Reqq Link Shortener" />
        <meta name="og:title" content="Reqq Link Shortener" />
        <meta property="og:type" content="website" />
        <meta name="twitter:image" content="https://www.reqq.cc/card.png" />
        <meta property="og:image" content="https://www.reqq.cc/card.png" />
        <title>Reqq Link Shortener</title>
      </Head>
      <Heading as="h1">Reqq</Heading>
      <Heading mt={6} as="h2">
        Link Shortener
      </Heading>
    </Container>
  );
};
export default Header;
