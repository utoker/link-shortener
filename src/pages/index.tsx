import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Header from '../components/header';
import Navbar from '../components/navbar';

const CreateLinkForm = dynamic(() => import('../components/create-link-form'), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <div>
      <Navbar />
      <Header />
      <CreateLinkForm />
    </div>
  );
};

export default Home;
