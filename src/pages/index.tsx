import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Header from '../components/header';
import Navbar from '../components/navbar';
import ShortlinksList from '../components/shortlinks-list';
import { GetServerSideProps } from 'next';
import { prisma } from '../db/client';

import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { Shortlinks } from '@prisma/client';

const CreateLinkForm = dynamic(() => import('../components/create-link-form'), {
  ssr: false,
});

interface HomeProps {
  shortlinks: Shortlinks[];
  slugs: string[];
}

const Home: NextPage<HomeProps> = ({ shortlinks, slugs }) => {
  return (
    <div>
      <Navbar />
      <Header />
      <CreateLinkForm slugs={slugs} />
      <ShortlinksList shortlinks={shortlinks} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // fetch shortlinks from db
  const session = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions
  );

  // get slugs from db
  const shortlinks = await prisma.shortlinks.findMany();
  const slugs = shortlinks.map((s) => s.slug);

  if (session?.user?.email || typeof session === 'string') {
    const email: any = session?.user?.email;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    const response = await prisma.shortlinks.findMany({
      where: {
        userId: user?.id,
      },
    });
    const shortlinks = JSON.parse(JSON.stringify(response));
    return {
      props: { shortlinks, slugs },
    };
  }
  return {
    props: { slugs },
  };
};

export default Home;
