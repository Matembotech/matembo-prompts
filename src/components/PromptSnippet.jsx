// Clamped multi-line excerpt. Prefers an author-written excerpt; otherwise
// falls back to the image/video prompt text.
function normalize(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function PromptSnippet({
  excerpt,
  imagePrompt,
  videoPrompt,
  maxLength = 120,
  lines = 2,
  style,
}) {
  const text =
    normalize(excerpt) ||
    normalize(imagePrompt) ||
    normalize(videoPrompt) ||
    'No prompt available yet.';

  if (text.length > maxLength && maxLength > 0) {
    // Cut at the last whole word within the limit.
    const cutAt = text.lastIndexOf(' ', maxLength);
    return (
      <p
        style={{
          margin: 0,
          color: '#6b7280',
          fontSize: 14,
          lineHeight: 1.55,
          fontFamily: "'DM Sans', sans-serif",
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: lines,
          ...style,
        }}
      >
        {`${cutAt > 0 ? text.slice(0, cutAt) : text.slice(0, maxLength)}…`}
      </p>
    );
  }

  return (
    <p
      style={{
        margin: 0,
        color: '#6b7280',
        fontSize: 14,
        lineHeight: 1.55,
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: lines,
        ...style,
      }}
    >
      {text}
    </p>
  );
}