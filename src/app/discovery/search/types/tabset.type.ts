import { AfterContentInit, Component, ElementRef } from "@angular/core";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: "formly-field-tabset",
  template: `
    <mat-tab-group animationDuration="0ms" class="dynamic-height">
      <mat-tab *ngFor="let f of field.fieldGroup">
        <ng-template mat-tab-label>
          <span>{{ f.templateOptions.tabTitle }}</span>
        </ng-template>
        <formly-field [field]="f"></formly-field>
      </mat-tab>
    </mat-tab-group>
  `
})
export class FormlyFieldTabsetComponent extends FieldType {
  constructor() {
    super();
  }
}
