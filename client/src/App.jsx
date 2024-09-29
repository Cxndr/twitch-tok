import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useContext } from "react";

import FeedPage from "./pages/FeedPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import SavedPage from "./pages/SavedPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";

import Header from "./components/Header";

import SERVER_URL from "./config";


export default function App() {
  
  const [login, setLogin] = useState(null);

  async function getUser(user) {
    const url = `${SERVER_URL}/user?`
      + new URLSearchParams({
        "username": encodeURIComponent(user).toString()
      })
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const userJSON = await response.json()
    return userJSON;
  }

  function userLogin(user,pass) {
    
  }

  return (
    <BrowserRouter>
      <main>
        <Header/>
        <Routes>
          <Route path="/" element={<FeedPage/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
          {login && <Route path="/settings" element={<SettingsPage/>}/>}
          {login && <Route path="/saved" element={<SavedPage/>}/>}
          {login && <Route path="/profile" element={<ProfilePage/>}/>}
          <Route path="/search" element={<SearchPage/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}