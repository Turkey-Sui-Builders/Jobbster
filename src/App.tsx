import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Box, Container } from "@radix-ui/themes";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import HomePage from "./components/HomePage";
import DashboardPage from "./components/DashboardPage";
import JobDetail from "./components/JobDetail";
import CreateJob from "./components/CreateJob";
import Chatbot from "./components/Chatbot";
import FindBestJobPage from "./components/FindBestJobPage"; // İlan Listesi (Önceki adımlarda placeholder yapmıştık)

// Uygulama içi düzen (Navbar'ın göründüğü yer)
function AppLayout() {
  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "var(--gray-1)" }}>
      <Navbar /> {/* Connect Button burada */}
      <Container size="3" pt="6" pb="6">
        <Outlet /> {/* Alt sayfalar buraya render olur */}
      </Container>
      <Chatbot /> {/* Floating chatbot - her sayfada görünür */}
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Navbar yok, tam ekran tanıtım */}
        <Route path="/" element={<LandingPage />} />

        {/* Uygulama Sayfaları - Navbar var */}
        <Route element={<AppLayout />}>
           <Route path="/jobs" element={<HomePage />} />
           <Route path="/job/:jobId" element={<JobDetail />} />
           <Route path="/create-job" element={<CreateJob />} />
           <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/find-best-job" element={<FindBestJobPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;