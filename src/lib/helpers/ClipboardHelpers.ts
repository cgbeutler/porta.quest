
export function copyToClipboard(textToCopy: string): boolean {
  // Navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy);
    return true
  } else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
        
    // Move textarea out of the viewport so it's not visible
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";
        
    document.body.prepend(textArea);
    textArea.select();

    let probablySuccess = false
    try {
      document.execCommand('copy');
      probablySuccess = true
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
    return probablySuccess
  }
}
