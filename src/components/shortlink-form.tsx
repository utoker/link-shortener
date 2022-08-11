import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import { FC } from 'react';
import { Form } from './create-shortlink';

interface ShortlinkFormProps {
  slugError: boolean;
  url: string;
  form: Form;
  setSlugError: Function;
  setForm: Function;
  urlError: boolean;
  setUrlError: Function;
  saveShortLink: Function;
  slugInUse: boolean;
  setslugInUse: Function;
  slugs: string[];
}
const ShortlinkForm: FC<ShortlinkFormProps> = ({
  slugError,
  url,
  form,
  setSlugError,
  setForm,
  urlError,
  setUrlError,
  saveShortLink,
  slugInUse,
  setslugInUse,
  slugs,
}) => {
  const slugValidator = /^[-a-zA-Z0-9]+$/;
  const urlValidator =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;

  return (
    <Container mt={50} centerContent>
      <FormControl isInvalid={slugError}>
        <FormErrorMessage m={1}>
          Only alphanumeric characters and hypens are allowed. No spaces.
        </FormErrorMessage>
        {slugInUse && <Text>Short url already in use.</Text>}
        <Box>
          <InputGroup>
            <InputLeftAddon>{`${url}/`}</InputLeftAddon>
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
                setForm({
                  ...form,
                  slug,
                });
                if (!slugValidator.test(slug)) {
                  setSlugError(true);
                }
                if (slugValidator.test(slug)) {
                  setSlugError(false);
                }
                if (slugs.includes(form.slug)) {
                  setslugInUse(true);
                }
                if (!slugs.includes(form.slug)) {
                  setslugInUse(false);
                }
              }}
            />
            <InputRightElement width="4.5rem">
              <Button
                colorScheme="teal"
                variant="outline"
                mr={2}
                size="sm"
                onClick={() => {
                  const slug = nanoid(5);
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
                disabled={urlError || slugError || slugInUse}
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
export default ShortlinkForm;
