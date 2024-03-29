import type { NextPage } from 'next';
import { useState } from 'react';
import Complete from './complete';
import ShortlinkForm from './shortlink-form';

export type Form = {
  slug: string;
  url: string;
};

interface CreateShortLinkProps {
  slugs: string[];
}

const CreateShortLink: NextPage<CreateShortLinkProps> = ({ slugs }) => {
  const [form, setForm] = useState<Form>({ slug: '', url: '' });
  const url = window.location.origin;
  const [urlError, setUrlError] = useState<boolean>(false);
  const [slugError, setSlugError] = useState<boolean>(false);
  const [slugInUse, setslugInUse] = useState<boolean>(false);
  const [complete, setComplete] = useState<boolean>(false);
  if (complete) {
    return (
      <Complete
        form={form}
        setForm={setForm}
        setComplete={setComplete}
        url={url}
      />
    );
  }

  async function saveShortLink(form: Form) {
    //check if slug is already in use
    if (slugs.includes(form.slug)) {
      return;
    }

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

  return (
    <ShortlinkForm
      slugError={slugError}
      url={url}
      form={form}
      setSlugError={setSlugError}
      setForm={setForm}
      urlError={urlError}
      setUrlError={setUrlError}
      saveShortLink={saveShortLink}
      slugInUse={slugInUse}
      setslugInUse={setslugInUse}
      slugs={slugs}
    />
  );
};

export default CreateShortLink;
