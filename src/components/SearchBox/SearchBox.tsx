import React, { useState } from 'react';
import css from './SearchBox.module.css'

export default function SearchBox({ onChange }: { onChange: (val: string) => void }) {
  const [localValue, setLocalValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val); 
    onChange(val);   
  };

  return (
    <input
      className={css.input}
      type="text"
      placeholder="Search notes..."
      value={localValue}
      onChange={handleChange}
    />
  );
}

