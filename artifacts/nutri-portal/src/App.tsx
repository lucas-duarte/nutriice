import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout";

// Auth Pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

// Nutritionist Pages
import NutriDashboard from "@/pages/nutritionist/dashboard";
import PatientsList from "@/pages/nutritionist/patients";
import PatientForm from "@/pages/nutritionist/patient-form";
import PatientDetail from "@/pages/nutritionist/patient-detail";
import DietForm from "@/pages/nutritionist/diet-form";
import DietDetail from "@/pages/nutritionist/diet-detail";
import MealForm from "@/pages/nutritionist/meal-form";
import AppointmentsList from "@/pages/nutritionist/appointments";
import AppointmentForm from "@/pages/nutritionist/appointment-form";
import PatientBioDashboard from "@/pages/nutritionist/patient-dashboard";
import BioimpedanceForm from "@/pages/nutritionist/bioimpedance-form";
import PatientEdit from "@/pages/nutritionist/patient-edit";
import ChangePassword from "@/pages/nutritionist/change-password";
import Settings from "@/pages/nutritionist/settings";
import ForgotPassword from "@/pages/auth/forgot-password";

// Patient Pages
import PatientDashboard from "@/pages/patient/dashboard";
import PatientDiets from "@/pages/patient/diets";
import PatientDietDetail from "@/pages/patient/diet-detail";
import PatientAppointments from "@/pages/patient/appointments";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, role, ...rest }: { component: any, role: "nutritionist" | "patient", [key: string]: any }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user?.role !== role) {
    return <Redirect to={user?.role === "nutritionist" ? "/dashboard" : "/patient/dashboard"} />;
  }

  return (
    <DashboardLayout role={role}>
      <Component {...rest} />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* Nutritionist Routes */}
      <Route path="/dashboard"><ProtectedRoute component={NutriDashboard} role="nutritionist" /></Route>
      <Route path="/patients"><ProtectedRoute component={PatientsList} role="nutritionist" /></Route>
      <Route path="/patients/new"><ProtectedRoute component={PatientForm} role="nutritionist" /></Route>
      <Route path="/patients/:id/edit"><ProtectedRoute component={PatientEdit} role="nutritionist" /></Route>
      <Route path="/patients/:id"><ProtectedRoute component={PatientDetail} role="nutritionist" /></Route>
      
      <Route path="/patients/:id/diets/new"><ProtectedRoute component={DietForm} role="nutritionist" /></Route>
      <Route path="/diets/:id"><ProtectedRoute component={DietDetail} role="nutritionist" /></Route>
      <Route path="/diets/:id/meals/new"><ProtectedRoute component={MealForm} role="nutritionist" /></Route>
      
      <Route path="/appointments"><ProtectedRoute component={AppointmentsList} role="nutritionist" /></Route>
      <Route path="/appointments/new"><ProtectedRoute component={AppointmentForm} role="nutritionist" /></Route>

      <Route path="/patients/:id/dashboard"><ProtectedRoute component={PatientBioDashboard} role="nutritionist" /></Route>
      <Route path="/patients/:id/bioimpedance/new"><ProtectedRoute component={BioimpedanceForm} role="nutritionist" /></Route>
      <Route path="/change-password"><ProtectedRoute component={ChangePassword} role="nutritionist" /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} role="nutritionist" /></Route>

      {/* Patient Routes */}
      <Route path="/patient/dashboard"><ProtectedRoute component={PatientDashboard} role="patient" /></Route>
      <Route path="/patient/diets"><ProtectedRoute component={PatientDiets} role="patient" /></Route>
      <Route path="/patient/diets/:id"><ProtectedRoute component={PatientDietDetail} role="patient" /></Route>
      <Route path="/patient/appointments"><ProtectedRoute component={PatientAppointments} role="patient" /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
