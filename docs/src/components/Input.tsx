import React from 'react';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
  error?: string | null;
}

export function Input({ onChange, error, ...props }: InputProps) {
  return <input {...props} onChange={(e) => onChange(e.target.value)} />;
}
