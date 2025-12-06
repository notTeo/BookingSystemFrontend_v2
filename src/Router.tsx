import { BrowserRouter, Routes, Route } from "react-router-dom";

// Route guard
import RequireAuth from "./components/RequireAuth";
// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import ShopLayout from "./layouts/ShopLayout";
// PROTECTED – global
import AddBooking from "./pages/protected/Bookings/AddBooking/AddBooking";
import AllBookings from "./pages/protected/Bookings/AllBookings/AllBookings";
import Calendar from "./pages/protected/Bookings/Calendar/Calendar";
import Inbox from "./pages/protected/Inbox/Inbox";
import Overview from "./pages/protected/Overview/Overview";
import ServiceLibrary from "./pages/protected/Services/ServiceLibrary/ServiceLibrary";
import Account from "./pages/protected/Settings/Account/Account";
import Billing from "./pages/protected/Settings/Billing/Billing";
import AllShops from "./pages/protected/Shops/AllShops/AllShops";
import CreateShop from "./pages/protected/Shops/CreateShop/CreateShop";
// PROTECTED – shop-specific
import ShopOverview from "./pages/protected/Shops/ShopOverview/ShopOverview";
import AllTeam from "./pages/protected/Team/AllTeam/AllTeam";
import Invite from "./pages/protected/Team/Invite/Invite";
import UserOverview from "./pages/protected/Team/UserOverview/UserOverview";
// PUBLIC pages
import LoginPage from "./pages/public/LoginPage/LoginPage";
import MainPage from "./pages/public/MainPage/MainPage";
import NotFoundPage from "./pages/public/NotFoundPage/NotFoundPage";
import RegisterPage from "./pages/public/RegisterPage/RegisterPage";
// Providers
import { AuthProvider } from "./providers/AuthProvider";
import { ShopProvider } from "./providers/ShopProvider";
export default function Router() {
  return (
    <BrowserRouter>
      {/* Global providers */}
      <AuthProvider>
        <ShopProvider>
          <Routes>
            {/* PUBLIC */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* PROTECTED */}
            <Route element={<RequireAuth />}>
              <Route element={<DashboardLayout />}>
                <Route path="*" element={<NotFoundPage />} />
                {/* Global, not tied to one shop */}
                <Route path="/overview" element={<Overview />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/shops" element={<AllShops />} />
                <Route path="/new-shop" element={<CreateShop />} />
                <Route path="/settings/account" element={<Account />} />
                <Route path="/settings/billing" element={<Billing />} />

                {/* Shop-specific */}
                <Route path="/shops/:shopName" element={<ShopLayout />}>
                  <Route index element={<ShopOverview />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="bookings" element={<AllBookings />} />
                  <Route path="bookings/new" element={<AddBooking />} />
                  <Route path="services" element={<ServiceLibrary />} />
                  <Route path="team" element={<AllTeam />} />
                  <Route path="team/:teamName" element={<UserOverview />} />
                  <Route path="team/invite" element={<Invite />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
