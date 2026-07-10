/**
 * HamsterAvatar — circular hamster image with cute border.
 * Props:
 *   - src: image path
 *   - alt: alt text
 *   - size: optional, defaults to 200
 *   - onClick: optional click handler
 */
const HamsterAvatar = ({ src, alt, size = 200, onClick }) => {
  return (
    <div
      className="hamster-avatar"
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        onError={(e) => { e.target.src = '/hamsters/Boba.jpg'; }}
      />
    </div>
  );
};

export default HamsterAvatar;
