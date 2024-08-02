import React, { useState } from 'react';
import axios from 'axios';

const EntryExitForm: React.FC = () => {
  const [personId, setPersonId] = useState('');
  const [gate, setGate] = useState('');
  const [type, setType] = useState<'entry' | 'exit'>('entry');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3000/api/${type}`, { personId, gate });
      alert(`${type} registered successfully`);
    } catch (err) {
      alert(`Error registering ${type}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Person ID:
        <input type="text" value={personId} onChange={(e) => setPersonId(e.target.value)} required />
      </label>
      <label>
        Gate:
        <input type="text" value={gate} onChange={(e) => setGate(e.target.value)} required />
      </label>
      <label>
        Type:
        <select value={type} onChange={(e) => setType(e.target.value as 'entry' | 'exit')}>
          <option value="entry">Entry</option>
          <option value="exit">Exit</option>
        </select>
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default EntryExitForm;
