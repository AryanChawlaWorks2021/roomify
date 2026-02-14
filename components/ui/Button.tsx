import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}) => {
  const classes = cx(
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--fullWidth',
    className
  );

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
