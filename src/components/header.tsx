// /components/Header.tsx
// Header component for the app

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Reqq.cc - Link Shortener',
}) => {
  return (
    <div className="mt-10 bg-primary py-6 text-center text-foreground">
      <h1 className="text-4xl font-bold tracking-wide">{title}</h1>
      <p className="mt-2 text-lg text-muted">Easily shorten your links</p>
    </div>
  );
};

export default Header;
