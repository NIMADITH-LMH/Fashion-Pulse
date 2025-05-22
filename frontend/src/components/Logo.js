const Logo = ({w,h}) => {
  return (
    <svg width={w} height={h} viewBox="0 0 300 200" className="css-1j8o68f">
      <defs id="SvgjsDefs1029"></defs>
      <g id="logo-container" transform="translate(20, 65)">
        {/* Fashion on top line */}
        <text x="0" y="0" fontFamily="serif" fontSize="72" fontWeight="bold" letterSpacing="1" fill="#292929">F</text>
        <text x="50" y="0" fontFamily="serif" fontSize="72" fill="#292929">ashion</text>
        
        {/* Pulse centered under Fashion */}
        <text x="90" y="80" fontFamily="serif" fontSize="72" fontWeight="bold" letterSpacing="1" fill="#292929">P</text>
        <text x="140" y="80" fontFamily="serif" fontSize="72" fill="#292929">ulse</text>
        
        {/* Cursor/hand icon */}
        
        
        {/* "to hide" text at bottom */}
        <text x="100" y="120" fontFamily="sans-serif" fontSize="24" fill="#292929">Shop To Here</text>
      </g>
    </svg>
  )
}
export default Logo