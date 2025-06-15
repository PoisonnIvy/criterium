import { Route, Routes } from "react-router-dom";
import { Login, Signup, Home, Landing, Project, ProjectDetail } from "./pages";

function App() {
  return (
    <div className="App">
      
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/project" element={<Project/>} />
          <Route path="/project/:id" element={<ProjectDetail />} />
        </Routes> 
    </div>
  );
}

export default App;
