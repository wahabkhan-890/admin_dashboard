/*
========================
SECTION: MODULE OVERVIEW
========================
*/

function TypewriterText({ text, className = "", delay = "0s", speed = "2.6s" }) {
  return (
    <span
      className={`typewriter ${className}`}
      style={{ "--typewriter-chars": text.length, "--typewriter-delay": delay, "--typewriter-speed": speed }}
    >
      {text}
    </span>
  );
}

export default TypewriterText;

