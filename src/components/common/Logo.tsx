import classNames from 'classnames';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  inverted?: boolean;
}

const Logo = ({ size = 'medium', inverted = false }: LogoProps) => {
  const imgClasses = classNames(
    {
      'w-24 h-8': size === 'small',
      'w-32 h-11': size === 'medium', 
      'w-48 h-16': size === 'large'
    }
  );

  return (
    <div className="flex items-center">
      <img 
        src="/logo.svg" 
        alt="CadenceIQ Logo" 
        className={imgClasses}
      />
    </div>
  );
};

export default Logo;