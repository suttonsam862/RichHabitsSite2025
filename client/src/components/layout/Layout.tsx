import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      {showHeader && <Header />}
      <main className={showHeader ? 'page-content' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;