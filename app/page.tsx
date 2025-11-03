import Link from 'next/link';
import { ArrowRight, FileText, Kanban, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
              <span className="text-lg md:text-xl font-bold">SyncGrid</span>
            </div>
            <div className="flex gap-2 md:gap-4">
              <Link
                href="/login"
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
            Collaborate in
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Real-Time
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            A powerful workspace combining rich documentation and agile planning.
            Work together seamlessly with your team.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-lg text-base md:text-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16 lg:mt-24">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Rich Documentation</h3>
            <p className="text-sm md:text-base text-gray-600">
              Confluence-style editor with real-time collaboration, versioning,
              and rich formatting options.
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Kanban className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Visual Planning</h3>
            <p className="text-sm md:text-base text-gray-600">
              Jira-style Kanban boards with drag-and-drop, inline editing, and
              seamless page linking.
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm md:text-base text-gray-600">
              Live presence indicators, mentions, comments, and role-based
              access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}