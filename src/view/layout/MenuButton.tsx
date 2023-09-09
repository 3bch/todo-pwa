import { clsx } from 'clsx';
import { type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

export type MenuButtonProps = {
  label: string;
  path: string;
};

export const MenuButton: FC<MenuButtonProps> = ({ label, path }) => {
  const location = useLocation();

  // TODO: button なしにしてもよいかも？

  return location.pathname === path ? (
    <button
      disabled={true}
      className={clsx(
        'h-full w-full',
        'bg-primary-600',
        'text-white',
        'transition-colors duration-200',
      )}
    >
      {label}
    </button>
  ) : (
    <button
      className={clsx(
        'h-full w-full',
        'bg-primary-400 hover:bg-primary-500',
        'text-white',
        'transition-colors duration-200',
      )}
    >
      <Link to={path}>{label}</Link>
    </button>
  );
};
