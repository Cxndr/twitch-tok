import SERVER_URL from "./config";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import FeedPage from "./pages/FeedPage";
import SettingsPage from "./pages/SettingsPage";
import SavedPage from "./pages/SavedPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import Header from "./components/Header";

export default function App() {
  
  const [user, setUser] = useState(false);
  const [profileData, setProfileData] = useState([]);
  const [autoMode, setAutoMode] = useState(true);

  useEffect(() => {
    console.log("~ setting user ~");
    const storedUser = sessionStorage.getItem('authToken');
    if (storedUser) {
      setUser(true);
    }
  },[]);

  useEffect(() => {
    localStorage.setItem("autoMode", autoMode);
  },[autoMode]);
  
  useEffect(() => {  
    setAutoMode(JSON.parse(localStorage.getItem("autoMode")));
  },[])


  async function getProfile() {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
          console.error("user is not authenticated");
          return;
      }
      try {
          const response = await fetch(`${SERVER_URL}/profile`, {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`
              }
          });

          if (response.ok) {
              const responseJSON = await response.json();
              setProfileData(responseJSON);
          }
          else {
              throw new Error("Unauthorized or expired token");
          }
      }
      catch(err) {
          console.error(err);
      }
  }

  useEffect(() => {
      if (user) { 
          getProfile()
      }; 
  },[user]);

  console.log(profileData);

  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser} profileData={profileData} setProfileData={setProfileData}/>
      <main>
        <Routes>
          <Route path="/" element={<FeedPage profileData={profileData} getProfile={getProfile} autoMode={autoMode} setAutoMode={setAutoMode}/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
          <Route
            path="/settings" 
            element={<SettingsPage user={user} profileData={profileData} setProfileData={setProfileData} getProfile={getProfile}/>}
          />
          <Route path="/saved" element={<SavedPage profileData={profileData} getProfile={getProfile}/>}/>
          {user ? null : <Route path="/register" element={<RegisterPage/>}/>}
        </Routes>
      </main>
      <footer><span>🦥 by Matt Vandersluys</span></footer>
    </BrowserRouter>
  )
}