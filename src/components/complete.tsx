import { Button, Container, Flex, Heading, Text } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import React, { FC } from 'react';
import { Form } from './create-shortlink';

interface CompleteProps {
  form: Form;
  setForm: any;
  setComplete: any;
  url: string;
}

const Complete: FC<CompleteProps> = ({ form, setForm, setComplete, url }) => (
  <Container mt={50} centerContent>
    <Flex>
      <Heading as="h1">{`${url}/${form.slug}`}</Heading>
      <Button
        ml={4}
        variant="outline"
        onClick={() => {
          copy(`${url}/${form.slug}`);
        }}
      >
        <Text>Copy</Text>
      </Button>
    </Flex>
    <Button
      mt={4}
      size="lg"
      onClick={() => {
        setForm({ slug: '', url: '' });
        setComplete(false);
      }}
    >
      Home
    </Button>
  </Container>
);
export default Complete;
