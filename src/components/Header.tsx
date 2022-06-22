import { Container, Heading } from '@chakra-ui/react';

const Header = () => {
  return (
    <Container centerContent my={16}>
      <Heading as="h1">Link Shortener</Heading>
    </Container>
  );
};
export default Header;
