import { Injectable, signal } from '@angular/core';

export type SpeechProfile = 'neutral' | 'cheerful' | 'calm';

const PROFILES: Record<SpeechProfile, { rate: number; pitch: number; volume: number }> = {
  neutral: { rate: 1, pitch: 1, volume: 1 },
  cheerful: { rate: 1.05, pitch: 1.15, volume: 1 },
  calm: { rate: 0.9, pitch: 0.95, volume: 0.9 },
};

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  private synth = window.speechSynthesis;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  /** True while an utterance is actively being spoken. */
  readonly isSpeaking = signal(false);

  speak(
    text: string,
    options?: {
      profile?: SpeechProfile;
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: SpeechSynthesisVoice;
      /** Queue after any in-progress utterance instead of interrupting it. */
      queue?: boolean;
    }
  ) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Chrome: voices load asynchronously — speak() called before the first
    // 'voiceschanged' event can be silently dropped with no error at all.
    if (this.synth.getVoices().length === 0) {
      this.synth.addEventListener(
        'voiceschanged',
        () => this.speak(text, options),
        { once: true }
      );
      return;
    }

    if (!this.preferredVoice) {
      this.preferredVoice = this.pickPreferredVoice();
    }

    if (!options?.queue) {
      // Stop any previous utterance. Chrome can swallow a speak() issued in the
      // same tick as cancel(), so defer it to the next tick.
      this.synth.cancel();
    }

    const preset = PROFILES[options?.profile ?? 'neutral'];
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = options?.rate ?? preset.rate;
    utterance.pitch = options?.pitch ?? preset.pitch;
    utterance.volume = options?.volume ?? preset.volume;
    utterance.voice = options?.voice ?? this.preferredVoice ?? null;

    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = (e) => {
      this.isSpeaking.set(false);
      console.error('[Speech] error:', e.error, text);
    };

    const dispatch = () => this.synth.speak(utterance);
    options?.queue ? dispatch() : setTimeout(dispatch, 0);
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  /**
   * Rough spoken-duration estimate in seconds, before it's spoken (word count ÷ speaking rate).
   * Real synthesis timing varies by voice/engine
   */
  estimateSeconds(text: string, rate: number = 1): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const wordsPerMinuteAtRate1 = 150;
    return (words / (wordsPerMinuteAtRate1 * (rate || 1))) * 60;
  }

  setVoice(voice: SpeechSynthesisVoice | null) {
    this.preferredVoice = voice;
  }

  stop() {
    this.synth.cancel();
    this.isSpeaking.set(false);
  }

  private pickPreferredVoice(): SpeechSynthesisVoice | null {
    const voices = this.synth.getVoices();
    return (
      voices.find(v => v.lang.startsWith('en') && v.localService) ??
      voices.find(v => v.lang.startsWith('en')) ??
      voices[0] ??
      null
    );
  }
}
