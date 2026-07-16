import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image-more';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor() {}

  /** Share only text + url (Web Share API) */
  async shareText(title: string, text: string, url: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title,
        text: `${text}\n${url}`});
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      this.openFallbackLinks(text, url);
    }
  }

  // Tried dom-to-image-more here (SVG <foreignObject> + the browser's own
  // rasterizer) expecting better fidelity than html2canvas's from-scratch CSS
  // reimplementation — it made things worse (visible white rectangles at
  // rounded corners: foreignObject serialization is known to not reliably
  // clip border-radius+overflow:hidden, and it also struggles with nested
  // Angular child components like <app-quiz-progress>'s SVG donut). Reverted
  // to html2canvas, keeping the one fix that's genuinely engine-agnostic:
  // waiting for `document.fonts.ready` before capturing, since capturing
  // before a web font finishes downloading silently falls back to a system
  // font with different metrics — that was likely the real cause of the
  // original text-clipping/misalignment complaints, not the engine itself.
  private async captureElementAsPng(elementId: string): Promise<string | null> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id '${elementId}' not found`);
      return null;
    }
    if (document.fonts?.ready) {
      try { await document.fonts.ready; } catch { /* non-critical, proceed anyway */ }
    }
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      useCORS: true,
      scale: window.devicePixelRatio || 1,
    });
    return canvas.toDataURL('image/png');
  }

  /** Capture a DOM element and trigger a direct file download — no share-sheet,
   *  used by dedicated "Download" buttons as opposed to the share flow. */
  async downloadCardAsImage(elementId: string, filename = 'quiz-result.png'): Promise<boolean> {
    const dataUrl = await this.captureElementAsPng(elementId);
    if (!dataUrl) return false;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    return true;
  }

  /** Share a DOM element as an image */
  async shareCardAsImage(elementId: string, title: string, text: string, url: string) {
    const dataUrl = await this.captureElementAsPng(elementId);
    if (!dataUrl) return;
    text = '<b>'+title+'</b>'+text+'\n'+url;

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'quiz-result.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title,
          text,
          url,
          files: [file]
        });
      } catch (err) {
        console.error('Image share failed:', err);
      }
    } else {
      // fallback: download image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'quiz-result.png';
      link.click();
    }
  }

  /** Open fallback social share links */
  private openFallbackLinks(text: string, url: string) {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    // Example: open Twitter share
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    window.open(twitterUrl, '_blank');
  }

  //Try dom-to-image-more to create image + custom text in image
async shareCardWithLink(elementId: string, text: string, quizUrl: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* non-critical, proceed anyway */ }
  }
  const blob = await domtoimage.toBlob(element);
  const img = await createImageBitmap(blob);

  // Draw onto a new canvas
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height + 50; // space for link
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = '#000';
  ctx.font = '16px Arial';
  ctx.fillText(`View Full Report: ${quizUrl}`, 20, img.height + 30);

  const finalBlob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(b => resolve(b), 'image/png')
  );
  if (!finalBlob) return;

  const file = new File([finalBlob], 'quiz-result.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] });
  } else {
    // fallback: download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(finalBlob);
    link.download = 'quiz-result.png';
    link.click();
  }
}

}