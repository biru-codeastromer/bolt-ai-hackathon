import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

export const HighContrastToggle: React.FC = () => {
  const { highContrast, toggleHighContrast } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleHighContrast}
      aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
      leftIcon={highContrast ? <Sun size={16} /> : <Moon size={16} />}
    >
      {highContrast ? 'Standard Contrast' : 'High Contrast'}
    </Button>
  );
};