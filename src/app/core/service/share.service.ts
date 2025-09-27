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

  /** Share a DOM element as an image */
  async shareCardAsImage(elementId: string, title: string, text: string, url: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id '${elementId}' not found`);
      return;
    }

    const canvas = await html2canvas(element);
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(b => resolve(b), 'image/png')
    );

    if (!blob) return;

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
      link.href = canvas.toDataURL('image/png');
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

  //Try dom-to-image-more
async shareCardWithLink(elementId: string, score: number, quizUrl: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

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
  ctx.fillText(`View full result: ${quizUrl}`, 20, img.height + 30);

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