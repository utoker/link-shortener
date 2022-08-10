/* eslint-disable react/no-children-prop */
import type { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import debounce from 'lodash/debounce';
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
import { useSession } from 'next-auth/react';
import { prisma } from '../db/client';

type Form = {
  slug: string;
  url: string;
};

const CreateLinkForm: NextPage = () => {
  const [form, setForm] = useState<Form>({ slug: '', url: '' });
  const url = window.location.origin;
  const [urlError, setUrlError] = useState<boolean>(false);
  const [slugError, setSlugError] = useState<boolean>(false);
  const [complete, setComplete] = useState<boolean>(false);
  const { data: session } = useSession();

  if (complete) {
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
            setForm({ slug: '', url: '' });
            setComplete(false);
          }}
        >
          Home
        </Button>
      </Container>
    );
  }

  async function saveShortLink(form: Form) {
    const response = await fetch('/api/shortlinks', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (response.status === 200) {
      setComplete(true);
    }
    return await response.json();
  }

  const slugValidator = /^[-a-zA-Z0-9]+$/;
  const urlValidator =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;

  return (
    <Container mt={50} centerContent>
      <FormControl isInvalid={slugError}>
        <FormErrorMessage m={1}>
          Only alphanumeric characters and hypens are allowed. No spaces.
        </FormErrorMessage>
        {slugError && <Text>Short url already in use.</Text>}
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
                  setSlugError(true);
                } else {
                  setSlugError(false);
                }
                setForm({
                  ...form,
                  slug,
                });
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
                }}
              >
                Random
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </FormControl>
      <FormControl isInvalid={urlError}>
        <FormErrorMessage m={1}>
          Enter a valid URL with http or https
        </FormErrorMessage>
        <Box mt={1}>
          <InputGroup>
            <Input
              value={form.url}
              width="sm"
              size="lg"
              type="url"
              onChange={(e) => {
                const url = e.target.value;
                if (!urlValidator.test(url)) {
                  setUrlError(true);
                } else {
                  setUrlError(false);
                }
                setForm({
                  ...form,
                  url,
                });
              }}
              placeholder="Paste a long url"
              required
            />
            <InputRightElement width="7rem">
              <Button
                disabled={urlError || slugError}
                mt={2}
                colorScheme="teal"
                size="lg"
                onClick={() => {
                  if (form.slug === '') {
                    setSlugError(true);
                    return;
                  }
                  if (form.url === '') {
                    setUrlError(true);
                    return;
                  }
                  if (!slugError && !urlError) {
                    saveShortLink(form);
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
