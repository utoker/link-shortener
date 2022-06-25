import { Container, Heading } from '@chakra-ui/react';

const Header = () => {
  return (
    <Container centerContent>
      <Heading as="h1">Reqq</Heading>
      <Heading mt={6} as="h2">
        Link Shortener
      </Heading>
    </Container>
  );
};
export default Header;
