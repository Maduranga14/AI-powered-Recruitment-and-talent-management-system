import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

export default function Layout({ activePage, setActivePage, children, user, onLogout }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <div className="ml-[200px] flex-1 flex flex-col min-w-0">
                <Topbar user={user} onLogout={onLogout} />
                <main className="flex-1 p-7">{children}</main>
                <Footer />
            </div>
        </div>
    )
}
