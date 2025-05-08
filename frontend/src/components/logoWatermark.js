//goldfields logo with different sizing and layout

const Logo2 = () => {
  return (
    <div className="logo-container2">
      <img
        style={{ width: '310px', height: '253px', display: 'block', margin: 'auto' }}
        src="goldfieldslogoV2.png"
        alt=""
      />
    </div>
  );
};

// Export the logo path for use as a background image
export const watermarkLogoPath = "goldfieldslogoV2.png";

export default Logo2;