import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';

export type JourneyTrackStatus = 'complete' | 'active' | 'locked';

export interface JourneyTrack {
  id: number;
  name: string;
  level: string;
  completed: number;
  score?: number;
  accuracy?: number;
  status: JourneyTrackStatus;
}

interface JourneyNodeMetadata {
  id: number;
  centerPointX: number;
  status: JourneyTrackStatus;
  isTriggered: boolean;
}

@Component({
  selector: 'app-journey-locator',
  imports: [CommonModule],
  templateUrl: './journey-locator.component.html',
  styleUrl: './journey-locator.component.scss'
})
export class JourneyLocatorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() title = 'Java & Angular Full-Stack';
  @Input() subtitle = 'Scanning ecosystem logs... Tracking synchronized checkpoints.';
  @Input() tracks: JourneyTrack[] = [
    { id: 1, name: 'HTML5 Semantic Core', level: 'Beginner', completed: 100, score: 96, accuracy: 94, status: 'complete' },
    { id: 2, name: 'CSS Layout Systems', level: 'Intermediate', completed: 100, score: 90, accuracy: 85, status: 'complete' },
    { id: 3, name: 'JS Lang Architecture', level: 'Beginner', completed: 100, score: 98, accuracy: 96, status: 'complete' },
    { id: 4, name: 'DOM Traversal Engines', level: 'Intermediate', completed: 100, score: 92, accuracy: 90, status: 'complete' },
    { id: 5, name: 'Browser Object Model', level: 'Intermediate', completed: 100, score: 86, accuracy: 80, status: 'complete' },
    { id: 6, name: 'Inbuilt JS Objects', level: 'Intermediate', completed: 100, score: 94, accuracy: 91, status: 'complete' },
    { id: 7, name: 'ES6 Structural Specs', level: 'Advanced', completed: 100, score: 89, accuracy: 93, status: 'complete' },
    { id: 8, name: 'Asynchronous Runtime', level: 'Advanced', completed: 100, score: 91, accuracy: 88, status: 'complete' },
    { id: 9, name: 'Web Fetch & REST Calls', level: 'Intermediate', completed: 100, score: 95, accuracy: 92, status: 'complete' },
    { id: 10, name: 'TypeScript Core Engine', level: 'Intermediate', completed: 100, score: 90, accuracy: 89, status: 'complete' },
    { id: 11, name: 'Angular Framework Core', level: 'Intermediate', completed: 22, status: 'active' },
    { id: 12, name: 'RxJS Observables Stream', level: 'Advanced', completed: 0, status: 'locked' },
    { id: 13, name: 'Java Language Mechanics', level: 'Beginner', completed: 0, status: 'locked' },
    { id: 14, name: 'Java OOPs & Collections', level: 'Intermediate', completed: 0, status: 'locked' },
    { id: 15, name: 'Java 8 Streams & Lambdas', level: 'Advanced', completed: 0, status: 'locked' },
    { id: 16, name: 'Relational Databases & SQL', level: 'Intermediate', completed: 0, status: 'locked' },
    { id: 17, name: 'JDBC & Hibernate ORM', level: 'Intermediate', completed: 0, status: 'locked' },
    { id: 18, name: 'Spring Boot Microservices', level: 'Advanced', completed: 0, status: 'locked' },
    { id: 19, name: 'Spring Security & JWT', level: 'Advanced', completed: 0, status: 'locked' },
    { id: 20, name: 'Unit Testing (JUnit)', level: 'Intermediate', completed: 0, status: 'locked' },
    { id: 21, name: 'Docker Containerization', level: 'Intermediate', completed: 0, status: 'locked' },
    { id: 22, name: 'CI/CD Pipeline Configs', level: 'Advanced', completed: 0, status: 'locked' }
  ];

  @Output() resumeLearning = new EventEmitter<JourneyTrack>();
  @Output() openDashboard = new EventEmitter<void>();

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLDivElement>;
  @ViewChild('trackContainer') trackContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChildren('trackNode') trackNodeRefs?: QueryList<ElementRef<HTMLDivElement>>;

  progressWidth = 0;
  radarLeft = 0;
  radarSize = 0;
  radarVisible = false;
  isInteractive = false;
  dockVisible = false;
  ctaReady = false;
  trackOffset = 0;
  scannedNodeIds = new Set<number>();
  triggeredNodeIds = new Set<number>();

  private animationFrameId?: number;
  private currentX = 0;
  private nodesMetadata: JourneyNodeMetadata[] = [];

  get completedCount(): number {
    return this.tracks.filter((track) => track.status === 'complete').length;
  }

  get activeTrack(): JourneyTrack | undefined {
    return this.tracks.find((track) => track.status === 'active') || this.tracks.find((track) => track.status !== 'locked') || this.tracks[0];
  }

  ngAfterViewInit(): void {
    this.startScanner();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tracks'] && !changes['tracks'].firstChange) {
      window.setTimeout(() => this.startScanner());
    }
  }

  ngOnDestroy(): void {
    this.cancelScanner();
  }

  isScanned(track: JourneyTrack): boolean {
    return this.scannedNodeIds.has(track.id);
  }

  isTriggered(track: JourneyTrack): boolean {
    return this.triggeredNodeIds.has(track.id);
  }

  isComplete(track: JourneyTrack): boolean {
    return track.status === 'complete' && this.isTriggered(track);
  }

  isActive(track: JourneyTrack): boolean {
    return track.status === 'active' && this.isTriggered(track);
  }

  onResume(track: JourneyTrack): void {
    this.resumeLearning.emit(track);
  }

  private startScanner(): void {
    this.cancelScanner();
    this.resetScannerState();

    const trackContainer = this.trackContainerRef?.nativeElement;
    const nodeRefs = this.trackNodeRefs?.toArray() || [];
    const activeTrack = this.activeTrack;

    if (!trackContainer || !nodeRefs.length || !activeTrack) {
      return;
    }

    let activeNodeElement: HTMLDivElement | undefined;
    this.nodesMetadata = nodeRefs.map((nodeRef, index) => {
      const element = nodeRef.nativeElement;
      const track = this.tracks[index];

      if (track.id === activeTrack.id) {
        activeNodeElement = element;
      }

      return {
        id: track.id,
        centerPointX: element.offsetLeft + element.clientWidth / 2,
        status: track.status,
        isTriggered: false
      };
    });

    if (!activeNodeElement) {
      activeNodeElement = nodeRefs[0].nativeElement;
    }

    const targetFinalX = activeNodeElement.offsetLeft + activeNodeElement.clientWidth / 2;
    const pacingSpeed = 3.8;

    const runCinematicScanner = () => {
      if (this.currentX < targetFinalX) {
        this.currentX += pacingSpeed;
        if (this.currentX > targetFinalX) {
          this.currentX = targetFinalX;
        }

        this.progressWidth = this.currentX;
        this.radarVisible = true;
        this.radarLeft = this.currentX;
        this.radarSize = 36 + Math.sin(this.currentX * 0.05) * 8;

        this.nodesMetadata.forEach((node) => {
          if (node.isTriggered) {
            return;
          }

          if (this.currentX >= node.centerPointX - 110 && this.currentX < node.centerPointX) {
            this.scannedNodeIds.add(node.id);
          }

          if (this.currentX >= node.centerPointX) {
            node.isTriggered = true;
            this.scannedNodeIds.add(node.id);
            this.triggeredNodeIds.add(node.id);
          }
        });

        this.trackOffset = -this.currentX;
        this.animationFrameId = requestAnimationFrame(runCinematicScanner);
        return;
      }

      window.setTimeout(() => this.finishScanner(activeNodeElement), 300);
    };

    this.animationFrameId = requestAnimationFrame(runCinematicScanner);
  }

  private finishScanner(activeNodeElement: HTMLDivElement): void {
    const canvas = this.canvasRef?.nativeElement;

    this.radarVisible = false;
    this.trackOffset = 0;
    this.isInteractive = true;
    this.ctaReady = true;
    this.dockVisible = true;
    this.tracks.forEach((track) => this.scannedNodeIds.add(track.id));

    if (canvas) {
      canvas.scrollLeft = activeNodeElement.offsetLeft - canvas.clientWidth / 2 + activeNodeElement.clientWidth / 2;
    }
  }

  private resetScannerState(): void {
    this.currentX = 0;
    this.progressWidth = 0;
    this.radarLeft = 0;
    this.radarSize = 0;
    this.radarVisible = false;
    this.isInteractive = false;
    this.dockVisible = false;
    this.ctaReady = false;
    this.trackOffset = 0;
    this.scannedNodeIds = new Set<number>();
    this.triggeredNodeIds = new Set<number>();
    this.nodesMetadata = [];
  }

  private cancelScanner(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }
}
