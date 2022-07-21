import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

const CreateLinkForm = dynamic(() => import('../components/CreateLinkForm'), {
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
