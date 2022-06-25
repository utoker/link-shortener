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
  FormErrorMessage,
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
  const [error, setError] = useState<boolean>(false);

  const slugCheck = trpc.useQuery(['slugCheck', { slug: form.slug }], {
    refetchOnReconnect: false, // replacement for enable: false which isn't respected.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const createSlug = trpc.useMutation(['createSlug']);

  if (createSlug.status === 'success') {
    return (
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
            createSlug.reset();
            setForm({ slug: '', url: '' });
          }}
        >
          Reset
        </Button>
      </Container>
    );
  }

  const slugValidator = /^[-a-zA-Z0-9]+$/;
  const urlValidator =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;
  //  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
  //  /^[-a-zA-Z0-9]+$/;

  return (
    <Container mt={50} centerContent>
      <FormControl isInvalid={error}>
        <FormErrorMessage m={1}>
          Only alphanumeric characters and hypens are allowed. No spaces.
        </FormErrorMessage>
        {slugCheck.data?.used && <Text>Short url already in use.</Text>}
        <Box>
          <InputGroup>
            <InputLeftAddon children={`${url}/`} />
            <Input
              minLength={1}
              // pattern={'^[-a-zA-Z0-9]+$'}
              title="Only alphanumeric characters and hypens are allowed. No spaces."
              required
              type="text"
              placeholder="short url"
              value={form.slug}
              onChange={(e) => {
                const slug = e.target.value;
                if (!slugValidator.test(slug)) {
                  setError(true);
                } else {
                  setError(false);
                }
                setForm({
                  ...form,
                  slug,
                });
                debounce(slugCheck.refetch, 200);
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
      </FormControl>
      <FormControl>
        <Box mt={1}>
          <InputGroup>
            <Input
              value={form.url}
              width="sm"
              size="lg"
              type="url"
              onChange={(e) => {
                const url = e.target.value;
                // if (!urlValidator.test(url)) {
                //   setError(true);
                // } else {
                //   setError(false);
                // }
                setForm({
                  ...form,
                  url,
                });
                debounce(slugCheck.refetch, 200);
              }}
              placeholder="Paste a long url"
              required
            />
            <InputRightElement width="7rem">
              <Button
                mt={2}
                colorScheme="teal"
                size="lg"
                onClick={() => {
                  if (form.slug === '' && form.url === '') {
                    setError(true);
                    return;
                  }
                  if (!error) {
                    createSlug.mutate({ ...form });
                  }
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
