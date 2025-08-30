import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext({});

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [currentFolderPath, setCurrentFolderPath] = useState('');
  const [currentPath, setCurrentPath] = useState([]);

  const navigateToFolder = (folder) => {
    const newPath = [...currentPath, { id: folder.id, name: folder.name }];
    setCurrentPath(newPath);
    setCurrentFolderPath(newPath.length === 0 ? '' : newPath.map(p => p.name).join('/'));
  };

  const navigateBack = () => {
    const newPath = currentPath.slice(0, -1);
    setCurrentPath(newPath);
    setCurrentFolderPath(newPath.length === 0 ? '' : newPath.map(p => p.name).join('/'));
  };

  const navigateToRoot = () => {
    setCurrentPath([]);
    setCurrentFolderPath('');
  };

  const value = {
    currentFolderPath,
    currentPath,
    setCurrentFolderPath,
    setCurrentPath,
    navigateToFolder,
    navigateBack,
    navigateToRoot,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext; 