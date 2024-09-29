import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useContext } from "react";

import FeedPage from "./pages/FeedPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import SavedPage from "./pages/SavedPage";
import SearchPage from "./pages/SearchPage";
import RegisterUser from "./pages/RegisterPage";
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
    const userJSON = await response.json();
    return userJSON;
  }

  async function checkLoginStatus() {
    try {
      const response = await fetch(`${SERVER_URL}/auth/status`, {
        method: "GET",
        credentials: "include"
      });
      const responseJSON = await response.json();
      console.log("AUTH RESPONSE: ", responseJSON);

      if (response.ok && response.loggedIn) {
        console.log("user logged in");
        return true;
      }
      if (response.status === 401) {
        console.log("user not logged in");
        return false;
      }
      else {
        console.log("error getting login status");
        return false;
      }
    }
    catch(err) {
      console.error(err);
      return false;
    }
  }

  checkLoginStatus().then(isLoggedIn => {
    if (isLoggedIn) {
      setLogin(true);
    }
  });


  console.log("LOGIN: ",login);

  return (
    <BrowserRouter>
      <main>
        <Header login={login} setLogin={setLogin}/>
        <Routes>
          <Route path="/" element={<FeedPage/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
          {login && <Route path="/settings" element={<SettingsPage/>}/>}
          {login && <Route path="/saved" element={<SavedPage/>}/>}
          {login && <Route path="/profile" element={<ProfilePage/>}/>}
          {login ? null : <Route path="/register" element={<RegisterUser/>}/>}
          <Route path="/search" element={<SearchPage/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}