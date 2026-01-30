import React, { useState } from 'react';
import { User, Project } from '../types';
import { storage } from '../services/storage';
import { Plus, Code, Globe, Trash2, Edit2 } from 'lucide-react';

interface DashboardProps {
  user: User;
  onOpenProject: (project: Project) => void;
  onCreateProject: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onOpenProject, onCreateProject }) => {
  const [projects, setProjects] = useState<Project[]>(storage.getProjects(user.id));

  const handleCreate = () => {
    const name = prompt("Project Name:", `project-${Math.floor(Math.random() * 1000)}`);
    if (!name) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      ownerId: user.id,
      html: '<!DOCTYPE html>\n<html>\n<head>\n<title>New Project</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      branch: 'main'
    };

    storage.saveProject(newProject);
    setProjects(storage.getProjects(user.id));
    onCreateProject(newProject);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this project?")) {
      storage.deleteProject(id);
      setProjects(storage.getProjects(user.id));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Your Projects</h2>
          <p className="text-gray-500 mt-1">Manage and deploy your AI-generated applications.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div 
            key={project.id} 
            onClick={() => onOpenProject(project)}
            className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:border-indigo-200 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Code size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Rename (Simulated)"><Edit2 size={14}/></button>
                 <button onClick={(e) => handleDelete(project.id, e)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-1">{project.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
               <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{project.branch}</span>
               <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                 <Globe size={12} />
                 cyberdoom.rf.gd/{user.username}/{project.name}
               </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
             <Code size={48} className="mx-auto mb-4 opacity-20" />
             <p>No projects yet. Create one to start building.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;