import Window from '../Window';

export default function AboutWindow({ active, onClose, onFocus, onMoreAbout }) {
  return (
    <Window
      title="LIL' ABOUT ME"
      windowClassName="about-me-window"
      active={active}
      onClose={onClose}
      onFocus={onFocus}
      footer={<div className="about-button" onClick={onMoreAbout}>MORE ABOUT ME</div>}
    >
      <p>
        HEY, I&apos;M BERKAN — MEDIA DESIGN STUDENT FROM THE NETHERLANDS. WHEN I&apos;M NOT
        PUSHING PIXELS I&apos;M PROBABLY PUSHING WEIGHTS. I BUILD STUFF THAT FEELS AS GOOD AS
        IT LOOKS — CLEAN DESIGN, SOLID FUNCTION, NO FLUFF.
      </p>
    </Window>
  );
}
