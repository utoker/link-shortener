import type { NextPage } from 'next';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { prisma } from '../db/client';
import Complete from './complete';
import Form from './form';

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
      <Complete
        form={form}
        setForm={setForm}
        setComplete={setComplete}
        url={url}
      />
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

  return (
    <Form
      slugError={slugError}
      url={url}
      form={form}
      setSlugError={setSlugError}
      setForm={setForm}
      urlError={urlError}
      setUrlError={setUrlError}
      saveShortLink={saveShortLink}
    />
  );
};

export default CreateLinkForm;
