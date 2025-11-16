import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AuthProvider } from "./providers/AuthProvider";
import { ShopProvider } from "./providers/ShopProvider";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ShopLayout from "./layouts/ShopLayout";

// Route guard
import RequireAuth from "./components/RequireAuth";

// PUBLIC pages
import MainPage from "./pages/public/MainPage/MainPage";
import LoginPage from "./pages/public/LoginPage/LoginPage";
import RegisterPage from "./pages/public/RegisterPage/RegisterPage";
import NotFoundPage from "./pages/public/NotFoundPage/NotFoundPage";

// PROTECTED – global
import Overview from "./pages/protected/Overview/Overview";
import Inbox from "./pages/protected/Inbox/Inbox";
import AllShops from "./pages/protected/Shops/AllShops/AllShops";
import CreateShop from "./pages/protected/Shops/CreateShop/CreateShop";
import Account from "./pages/protected/Settings/Account/Account";
import Billing from "./pages/protected/Settings/Billing/Billing";

// PROTECTED – shop-specific
import ShopOverview from "./pages/protected/Shops/ShopOverview/ShopOverview";
import Calendar from "./pages/protected/Bookings/Calendar/Calendar";
import AllBookings from "./pages/protected/Bookings/AllBookings/AllBookings";
import AddBooking from "./pages/protected/Bookings/AddBooking/AddBooking";
import ServiceLibrary from "./pages/protected/Services/ServiceLibrary/ServiceLibrary";
import AllTeam from "./pages/protected/Team/AllTeam/AllTeam";
import UserOverview from "./pages/protected/Team/UserOverview/UserOverview";
import Invite from "./pages/protected/Team/Invite/Invite";

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
            </Route>

            {/* PROTECTED */}
            <Route element={<RequireAuth />}>
              <Route element={<DashboardLayout />}>
                {/* Global, not tied to one shop */}
                <Route path="/overview" element={<Overview />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/shops" element={<AllShops />} />
                <Route path="/shops/new" element={<CreateShop />} />
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
