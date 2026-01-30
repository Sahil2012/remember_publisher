import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TextRevamp } from "@/components/TextRevamp";
import { Dashboard } from "@/pages/Dashboard";
import { BookView } from "@/pages/BookView";
import { Layout } from "@/components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/book/:bookId" element={<BookView />} />
          <Route path="/book/:bookId/page/:pageId" element={<TextRevamp />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;