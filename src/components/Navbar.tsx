import {
  Button,
  Container,
  Flex,
  Spacer,
  useColorMode,
} from '@chakra-ui/react';
import { BsSun, BsMoonStarsFill } from 'react-icons/bs';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Container mt={4}>
      <Flex>
        <Spacer />
        <Button
          aria-label="Toggle Color Mode"
          onClick={toggleColorMode}
          _focus={{ boxShadow: 'none' }}
          w="fit-content"
        >
          {colorMode === 'light' ? <BsMoonStarsFill /> : <BsSun />}
        </Button>
      </Flex>
    </Container>
  );
};
export default Navbar;
