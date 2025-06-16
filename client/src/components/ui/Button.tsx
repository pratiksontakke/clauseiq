import { ButtonHTMLAttributes, forwardRef, ElementType } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
};

type ButtonAsButton = ButtonBaseProps & 
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
  };

type ButtonAsLink = ButtonBaseProps & 
  Omit<LinkProps, keyof ButtonBaseProps> & {
    as: typeof Link;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(({
  className,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  as: Component = 'button',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-coral-primary text-white hover:bg-coral-primary/90 focus:ring-coral-primary/50",
    secondary: "bg-ink-light text-ink-text hover:bg-ink-light/90 focus:ring-ink-light/50",
    outline: "border-2 border-ink-text text-ink-text hover:bg-ink-text/5 focus:ring-ink-text/50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const classes = twMerge(
    clsx(
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      isLoading && "opacity-50 cursor-not-allowed",
      className
    )
  );

  if (Component === Link) {
    return (
      <Component
        ref={ref as any}
        className={classes}
        {...(props as ButtonAsLink)}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : children}
      </Component>
    );
  }

  return (
    <button
      ref={ref as any}
      className={classes}
      disabled={isLoading || (props as ButtonAsButton).disabled}
      {...(props as ButtonAsButton)}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 