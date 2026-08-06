import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WardrobePage from "./pages/WardrobePage";
import WardrobeDetailPage from "./pages/WardrobeDetailPage";
import OutfitCreatorPage from "./pages/OutfitCreatorPage";
import OutfitListPage from "./pages/OutfitListPage";
import OutfitDetailPage from "./pages/OutfitDetailPage";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ paddingTop: 32, minHeight: "calc(100vh - 64px)" }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/wardrobe" replace />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/wardrobe/:id" element={<WardrobeDetailPage />} />
            <Route path="/outfits" element={<OutfitListPage />} />
            <Route path="/outfits/create" element={<OutfitCreatorPage />} />
            <Route path="/outfits/:id" element={<OutfitDetailPage />} />
          </Route>
        </Routes>
      </main>
    </AuthProvider>
  );
}
