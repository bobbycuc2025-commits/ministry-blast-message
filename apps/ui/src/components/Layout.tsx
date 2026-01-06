import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/upload', label: 'Upload', icon: '📤' },
    { href: '/compose', label: 'Compose', icon: '✍️' },
    { href: '/queue', label: 'Queue', icon: '⏱️' },
    { href: '/reports', label: 'Reports', icon: '📊' },
    { href: '/members', label: 'Members', icon: '👥' },
    { href: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">
                ⛪ Ministry Messenger
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b overflow-x-auto">
        <div className="flex space-x-4 px-4 py-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                router.pathname === item.href
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <div className="w-64 bg-white border-r min-h-screen fixed">
          <div className="p-4 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="ml-64 flex-1">
          <main className="p-8">{children}</main>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        <main className="p-4">{children}</main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Ministry Messenger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}