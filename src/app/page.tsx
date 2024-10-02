import { ProtectedRoute } from '@/components/ProtectedRoute';
import Home from '@/components/Home';

export default function Page() {
  return (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  );
}