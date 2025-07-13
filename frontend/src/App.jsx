import { Route, Routes, useLocation } from "react-router-dom";
import { Login, Signup, Project,  Profile, Analize } from "./pages";
import './css/App.css'
import DrawerNav from "./layout/Drawer";
import Navbar from "./layout/Navbar";
import {AppProviders} from './providers/AppProviders.jsx'
import ProtectedRoute from "./context/ProtectedRoutes.jsx";
import { useEffect, useState } from "react";
import ProjectLayout from "./layout/ProjectLayout.jsx";
import {BaseForm, SearchArticles, Instances, Details, LoadFile, Library, Generator, Manage, Screening} from './layout/projectInternalLayout'
import Invitation from "./pages/Invitation.jsx";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <AppProviders>
      <Navbar onMenuClick={openDrawer}/>
      <DrawerNav open={drawerOpen} onClose={closeDrawer}/>
       <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invitacion/:token" element={<Invitation/>}/>

          <Route path="/perfil" element={
              <ProtectedRoute>
                <Profile/>
              </ProtectedRoute>
            }/>
            <Route path="/project" element={
              <ProtectedRoute>
                <Project/>
              </ProtectedRoute>
            } />


          <Route path="/project/:projectId" element={
            <ProtectedRoute>
              <ProjectLayout />
            </ProtectedRoute>
            }>

            <Route index element={<Details />} />
            <Route path="articles" element={<SearchArticles />} />
            <Route path="baseform" element={<BaseForm />} />
            <Route path="instances" element={<Instances />} />
            <Route path="graficos" element={<Generator />} />
            <Route path="upload" element={<LoadFile />} />
            <Route path="biblioteca" element={<Library />} />
            <Route path="config" element={<Manage />} />
            <Route path="screening" element={<Screening />} />

          </Route>
          <Route path="/analize/:assignmentId/:projectId/:articleId" element={<Analize/>}/>
        </Routes> 
      </div>
    </AppProviders>
  );
}

export default App;
