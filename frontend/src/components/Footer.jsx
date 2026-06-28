export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 px-7 py-4 flex items-center justify-between text-xs text-gray-500">
            <span>TalentPortal AI &nbsp;©&nbsp;2024 TalentPortal AI. All rights reserved.</span>
            <div className="flex gap-5">
                {["Privacy Policy", "Terms of Service", "Help Center", "Feedback"].map(link => (
                    <a key={link} href="#" className="text-gray-500 hover:text-gray-900 transition-colors">{link}</a>
                ))}
            </div>
        </footer>
    );
}
