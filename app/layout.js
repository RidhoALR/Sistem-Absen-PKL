import "./globals.css";

export const metadata = {
  title: "Sistem Absen PKL",
  description: "Attendance & logbook for PKL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-800 min-h-screen flex flex-col">
        <header className="bg-blue-800 text-white shadow-md">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-wide">Sistem Absen PKL</h1>
            <nav className="flex gap-4 text-sm font-medium">
              <a href="/entry" className="hover:text-blue-200 transition-colors">
                Absen
              </a>
              <a href="/entries" className="hover:text-blue-200 transition-colors">
                Logbook
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {children}
        </main>

        <footer className="text-center text-xs text-slate-400 py-4">
          PKL Group Logbook — {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}