import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import Footer from '../components/Footer';

export default function AdminLayout({ activePage, setActivePage, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="ml-[220px] flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-7">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
