import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface Topic {
  value: string;
  viewValue: string;
}

interface TopicGroup {
  disabled?: boolean;
  name: string;
  pokemon: Topic[];
}

@Component({
  selector: 'app-topic-form',
  imports: [ MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './topic-form.component.html',
  styleUrl: './topic-form.component.scss'
})
export class TopicFormComponent {
  topicForm: UntypedFormGroup;
  subjects = [
    "HTML", "CSS", "JavaScript", "Node", "Angular", "React", "Vue"
  ]
  topicGroups: TopicGroup[] = [
    {
      name: 'Variables and Constants',
      pokemon: [
        { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
        { value: 'oddish-1', viewValue: 'Oddish' },
        { value: 'bellsprout-2', viewValue: 'Bellsprout' },
      ],
    },
    {
      name: 'Control Structures',
      pokemon: [
        { value: 'squirtle-3', viewValue: 'Squirtle' },
        { value: 'psyduck-4', viewValue: 'Psyduck' },
        { value: 'horsea-5', viewValue: 'Horsea' },
      ],
    },
    {
      name: 'Operations',
      disabled: true,
      pokemon: [
        { value: 'Arithmetic', viewValue: 'Arithmetic' },
        { value: 'Logical', viewValue: 'Logical' },
        { value: 'flareon-8', viewValue: 'Others' },
      ],
    },
    {
      name: 'Functions',
      pokemon: [
        { value: 'Declarations', viewValue: 'Declarations' },
        { value: 'Expressions', viewValue: 'Expressions' },
      ],
    },
  ];
  
  constructor(fb: UntypedFormBuilder) {
    this.topicForm = fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z]+')]],
      subject: ['', [Validators.required]],
      parent: [''],
      label: ['', [Validators.required]],
      description: ['', [Validators.required]],
      is_published: [false]
    });
  }

  onTopicFormSubmit() {
    console.log('Topic Form Value', this.topicForm.value);
  }
}
