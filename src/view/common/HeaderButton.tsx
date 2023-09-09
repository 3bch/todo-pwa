import clsx from 'clsx';
import { type FC, type ReactNode } from 'react';

export type HeaderButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
  submit?: boolean;
};

export const HeaderButton: FC<HeaderButtonProps> = ({ children, onClick, submit }) => {
  return (
    <button
      className={clsx(
        'h-full w-full rounded-lg border text-xl font-bold',
        'border-primary-600 bg-white text-primary-600',
        'transition-colors duration-200 hover:bg-primary-100',
      )}
      onClick={onClick}
      type={submit ? 'submit' : undefined}
    >
      {children}
    </button>
  );
};
