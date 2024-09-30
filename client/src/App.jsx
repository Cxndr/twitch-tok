import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import FeedPage from "./pages/FeedPage";
import SettingsPage from "./pages/SettingsPage";
import SavedPage from "./pages/SavedPage";
import SearchPage from "./pages/SearchPage";
import RegisterUser from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import Header from "./components/Header";


export default function App() {
  
  const [user, setUser] = useState(false);

  useEffect(() => {
    console.log("~ setting user ~");
    const storedUser = sessionStorage.getItem('authToken');
    if (storedUser) {
      setUser(true);
    }
  },[]);

  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser}/>
      <main>
        <Routes>
          <Route path="/" element={<FeedPage/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
          <Route
            path="/settings" 
            element={<SettingsPage user={user}/>}
          />
          {user && <Route path="/saved" element={<SavedPage/>}/>}
          {user ? null : <Route path="/register" element={<RegisterUser/>}/>}
          <Route path="/search" element={<SearchPage/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}