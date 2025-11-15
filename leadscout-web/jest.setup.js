// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Convex React hooks
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useAction: jest.fn(),
  useConvex: jest.fn(),
  useConvexAuth: jest.fn(() => ({ isLoading: false, isAuthenticated: true })),
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  })),
  useAuth: jest.fn(() => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  })),
  ClerkProvider: ({ children }) => children,
  SignIn: () => <div>Sign In Mock</div>,
  SignUp: () => <div>Sign Up Mock</div>,
  UserButton: () => <div>User Button Mock</div>,
}))

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
