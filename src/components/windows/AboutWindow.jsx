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
        HEY, I&apos;M BERKAN! I&apos;M A MEDIA DESIGN STUDENT FROM THE NETHERLANDS AND I REALLY
        ENJOY MAKING CREATIVE PROJECTS THAT ACTUALLY MEAN SOMETHING. FOR ME IT&apos;S ALL ABOUT
        MAKING SURE SOMETHING DOESN&apos;T JUST LOOK NICE, BUT ALSO WORKS WELL FOR THE PEOPLE
        WHO USE IT.
      </p>
    </Window>
  );
}
