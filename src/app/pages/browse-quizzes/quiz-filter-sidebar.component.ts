import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    ],

})

export class QuizFilterSidebarComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
    skillType: 'Job' | 'Subject' = 'Job';
    @Input() open = false;
    @Input() selectedSubjectId: number | null = null;
    @Input() selectedTopicId: number | null = null;
    @Input() selectedJobId: number | null = 1;
    @Output() selectedSubjectIdChange = new EventEmitter<number>();
    @Output() selectedTopicIdChange = new EventEmitter<number>();
    @Output() selectedJobIdChange = new EventEmitter<number>();
    @Output() apply = new EventEmitter<void>();
    @Output() reset = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    subjects: any[] = [];
    topics: any[] = [];
    filteredTopics: any[] = [];
    filteredJobs: any[] = [];

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
        //filter if needed
        this.filteredJobs = this.master.jobRoles || [];
        console.log('[Sidebar] Jobs loaded:', this.filteredJobs);
        console.log('[Sidebar] Subjects loaded:', this.subjects);
        console.log('[Sidebar] Topics loaded:', this.topics);
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


    onJobChange() {
        // Find the selected job
        const selectedJob = this.filteredJobs.find(job => job.id === this.selectedJobId);
        if (selectedJob && selectedJob.subjects && selectedJob.subjects.length > 0) {
            this.subjects = selectedJob.subjects;
        } else {
            this.subjects = this.master.subjects || [];
        }
        // Reset subject and topic selection
        this.selectedSubjectId = 0;
        this.selectedTopicId = 0;
        this.filterTopics();
        this.selectedJobIdChange.emit(this.selectedJobId!);
        this.selectedSubjectIdChange.emit(this.selectedSubjectId);
        this.selectedTopicIdChange.emit(this.selectedTopicId);
    }

    filterTopics() {
        const sid = Number(this.selectedSubjectId);
        if (!sid) {
            this.filteredTopics = [...this.topics];
            return;
        }
        this.filteredTopics = this.topics.filter(
            (topic: any) => Number(topic.subjectId) === sid
        );
    }

    resetFilters() {
        this.selectedSubjectId = 0;
        this.selectedTopicId = 0;
        this.selectedJobId = 1;
        this.reset.emit();
        this.selectedSubjectIdChange.emit(this.selectedSubjectId);
        this.selectedTopicIdChange.emit(this.selectedTopicId);
        this.selectedJobIdChange.emit(this.selectedJobId);
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

    skillTypeChanged(event: any) {
        console.log('Skill type changed:', this.skillType);
        if(this.skillType === 'Subject') {
        this.subjects = this.master.subjects || [];
        }
        // You can add additional logic here if needed when the skill type changes
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
