import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MasterService } from '@core/service/master.service';
import { RightSidebarService } from '@core/service/rightsidebar.service';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { NgScrollbar } from 'ngx-scrollbar';

@Component({
    selector: 'quiz-filter-sidebar',
    templateUrl: './quiz-filter-sidebar.component.html',
    styleUrls: ['./quiz-filter-sidebar.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        NgClass,
        NgScrollbar,
        MatButtonToggleModule,
        MatIcon,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule
    ],
})
export class QuizFilterSidebarComponent extends UnsubscribeOnDestroyAdapter
    implements OnInit {
    @Input() open = false;
    @Input() selectedSubjectId: number | null = null;
    @Input() selectedTopicId: number | null = null;
    @Output() selectedSubjectIdChange = new EventEmitter<number>();
    @Output() selectedTopicIdChange = new EventEmitter<number>();
    @Output() apply = new EventEmitter<void>();
    @Output() reset = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    subjects: any[] = [];
    topics: any[] = [];
    filteredTopics: any[] = [];

    private rightSidebarService = inject(RightSidebarService);
    selectedBgColor = 'white';
    maxHeight!: string;
    maxWidth!: string;
    showpanel = false;
    isOpenSidebar!: boolean;
    isDarkSidebar = false;
    isDarTheme = false;
    public innerHeight?: number;
    headerHeight = 60;

    constructor(private master: MasterService) {
        super();
    }

    ngOnInit(): void {
        this.subjects = this.master.subjects || [];
        this.topics = this.master.topics || [];
        this.filterTopics();
        console.log('[Sidebar] Subjects:', this.subjects);
        console.log('[Sidebar] Topics:', this.topics);
        this.subs.sink = this.rightSidebarService.sidebarState.subscribe(
            (isRunning) => {
                this.isOpenSidebar = isRunning;
            }
        );
        this.setRightSidebarWindowHeight();
    }

    ngOnChanges(): void {
        this.filterTopics();
    }

    trackById(_: number, item: any) {
        return item.id;
    }

    onSubjectChange() {
        this.selectedSubjectIdChange.emit(this.selectedSubjectId!);
        this.filterTopics();
        console.log('[Sidebar] Subject changed:', this.selectedSubjectId);
        console.log('[Sidebar] Filtered topics:', this.filteredTopics);
    }

    filterTopics() {
        if (
            this.selectedSubjectId === null ||
            this.selectedSubjectId === undefined ||
            this.selectedSubjectId === 0
        ) {
            this.filteredTopics = [...this.topics];
        } else {
            this.filteredTopics = this.topics.filter(
                (topic: any) => topic.subjectId === this.selectedSubjectId
            );
        }
    }

    resetFilters() {
        this.selectedSubjectId = 0;
        this.selectedTopicId = 0;
        this.filterTopics();
        this.reset.emit();
        this.selectedSubjectIdChange.emit(this.selectedSubjectId);
        this.selectedTopicIdChange.emit(this.selectedTopicId);
        this.rightSidebarService.setRightSidebar(false);
        console.log('[Sidebar] Filters reset');
    }

    applyFilter() {
        this.apply.emit();
        this.rightSidebarService.setRightSidebar(false);
    }

    closeSidebar() {
        this.close.emit();
    }

    setRightSidebarWindowHeight() {
        this.innerHeight = window.innerHeight;
        const height = this.innerHeight - this.headerHeight;
        this.maxHeight = height + '';
        this.maxWidth = '500px';
    }

    onClickedOutside(event: Event) {
        const button = event.target as HTMLButtonElement;
        if (button.id !== 'settingBtn') {
            if (this.isOpenSidebar === true) {
                this.toggleRightSidebar();
            }
        }
    }

    toggleRightSidebar(): void {
        this.rightSidebarService.setRightSidebar(
            (this.isOpenSidebar = !this.isOpenSidebar)
        );
    }

    testClick() {
        console.log('Test click');
    }
}
