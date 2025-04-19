import AppRoutes from './routes/AppRoutes';
import { useAuth } from './context/AuthContext';
function App() {
  const { isLoggedIn } = useAuth();
  return <AppRoutes isLoggedIn={isLoggedIn} />;
}

export default App;
