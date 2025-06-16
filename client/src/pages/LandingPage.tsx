import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-cloud-bg">
      {/* Navigation */}
      <nav className="bg-white border-b border-ink-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-ink-text">ClauseIQ</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-ink-text hover:text-coral-primary"
              >
                Log in
              </Link>
              <Button
                as={Link}
                to="/register"
                variant="primary"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-ink-text">
              AI-Powered Contract Management
            </h1>
            <p className="mt-6 text-xl text-ink-medium max-w-3xl mx-auto">
              Streamline your contract lifecycle with intelligent automation. Extract clauses, detect risks, and collaborate seamlessly.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button
                as={Link}
                to="/register"
                variant="primary"
                size="lg"
              >
                Get Started Free
              </Button>
              <Button
                as={Link}
                to="/login"
                variant="outline"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink-text">
              Powerful Features for Modern Contract Management
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-ink-light/10 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-ink-text mb-2">
                AI Clause Extraction
              </h3>
              <p className="text-ink-medium">
                Automatically identify and categorize key clauses from your contracts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-ink-light/10 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-ink-text mb-2">
                Risk Detection
              </h3>
              <p className="text-ink-medium">
                Highlight potential risks and non-compliant terms automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-ink-light/10 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-ink-text mb-2">
                Contract Chat
              </h3>
              <p className="text-ink-medium">
                Ask questions about your contracts and get instant answers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg border border-ink-light/10 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-ink-text mb-2">
                Version Control
              </h3>
              <p className="text-ink-medium">
                Track changes and compare different versions effortlessly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg border border-ink-light/10 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">✍️</div>
              <h3 className="text-xl font-semibold text-ink-text mb-2">
                Digital Signatures
              </h3>
              <p className="text-ink-medium">
                Secure e-signatures with role-based signing workflow.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg border border-ink-light/10 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-ink-text mb-2">
                Analytics & Insights
              </h3>
              <p className="text-ink-medium">
                Track contract status, expiry dates, and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-coral-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Contract Management?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of companies using ClauseIQ to streamline their contract workflows.
          </p>
          <Button
            as={Link}
            to="/register"
            variant="secondary"
            size="lg"
            className="bg-white text-coral-primary hover:bg-white/90"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-ink-light/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-ink-medium">
            <p>© 2024 ClauseIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 