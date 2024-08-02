import React from 'react';
import EntryExitForm from './components/EntryExitForm';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  return (
    <div>
      <h1>Building Entry System</h1>
      <EntryExitForm />
      <Analytics />
    </div>
  );
};

export default App;
