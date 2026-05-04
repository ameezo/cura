import { AuthProvider } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/useTheme';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
