export const getSelectedText = () => {
  let text = '';
  if (typeof window.getSelection !== 'undefined') {
    text = window.getSelection().toString();
  } else if (typeof document.selection !== 'undefined' && document.selection.type === 'Text') {
    text = document.selection.createRange().text;
  }
  return text;
};

export const hasTouchSupport =
  'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch);
