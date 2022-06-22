/* eslint-disable react/no-children-prop */
import type { NextPage } from 'next';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import debounce from 'lodash/debounce';
import { trpc } from '../utils/trpc';
import copy from 'copy-to-clipboard';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Text,
} from '@chakra-ui/react';

type Form = {
  slug: string;
  url: string;
};

const CreateLinkForm: NextPage = () => {
  const [form, setForm] = useState<Form>({ slug: '', url: '' });
  const url = window.location.origin;

  const slugCheck = trpc.useQuery(['slugCheck', { slug: form.slug }], {
    refetchOnReconnect: false, // replacement for enable: false which isn't respected.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const createSlug = trpc.useMutation(['createSlug']);

  if (createSlug.status === 'success') {
    return (
      <Container mt={50} centerContent>
        <Flex className="flex justify-center items-center">
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
            createSlug.reset();
            setForm({ slug: '', url: '' });
          }}
        >
          Reset
        </Button>
      </Container>
    );
  }

  return (
    <Container mt={50} centerContent>
      <FormControl
        onSubmit={(e) => {
          e.preventDefault();
          createSlug.mutate({ ...form });
        }}
      >
        {slugCheck.data?.used && <Text>Slug already in use.</Text>}
        <Box>
          <InputGroup>
            <InputLeftAddon children={`${url}/`} />
            <Input
              minLength={1}
              pattern={'^[-a-zA-Z0-9]+$'}
              title="Only alphanumeric characters and hypens are allowed. No spaces."
              required
              type="text"
              placeholder="short link"
              value={form.slug}
              onChange={(e) => {
                setForm({
                  ...form,
                  slug: e.target.value,
                });
                debounce(slugCheck.refetch, 100);
              }}
            />
            <InputRightElement width="4.5rem">
              <Button
                colorScheme="teal"
                variant="outline"
                mr={2}
                size="sm"
                onClick={() => {
                  const slug = nanoid(6);
                  setForm({
                    ...form,
                    slug,
                  });
                  slugCheck.refetch();
                }}
              >
                Random
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
        <Box mt={1}>
          <InputGroup>
            <Input
              width="sm"
              size="lg"
              type="url"
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="Paste a long url"
              required
            />
            <InputRightElement width="7rem">
              <Button
                mt={2}
                colorScheme="teal"
                size="lg"
                onClick={() => {
                  createSlug.mutate({ ...form });
                }}
              >
                Shorten
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </FormControl>
    </Container>
  );
};

export default CreateLinkForm;
