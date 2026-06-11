import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Home } from "@/pages/Home";
import { AdvancedSearch } from "@/pages/AdvancedSearch";
import { SampleDetail } from "@/pages/SampleDetail";
import { Favorites } from "@/pages/Favorites";
import { Apply } from "@/pages/Apply";
import { Records } from "@/pages/Records";

export default function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<AdvancedSearch />} />
          <Route path="/sample/:id" element={<SampleDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}