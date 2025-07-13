import { AuthProvider, ProjectProvider } from '../context';

export const AppProviders=({children})=>{
   return (
    <AuthProvider>
      <ProjectProvider>
          {children}
      </ProjectProvider>
    </AuthProvider>
  );
}