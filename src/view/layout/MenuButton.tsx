import { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from '##/view/layout/MenuButton.module.css';

export type MenuButtonProps = {
  label: string;
  path: string;
};

export const MenuButton: FC<MenuButtonProps> = ({ label, path }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // TODO: button なしにしてもよいかも？

  return location.pathname === path ? (
    <button type='button' disabled={true} className={styles.menuButton}>
      {label}
    </button>
  ) : (
    <button type='button' className={styles.menuButton} onClick={() => navigate(path)}>
      {label}
    </button>
  );
};
