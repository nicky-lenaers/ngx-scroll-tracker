import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollTrackerDirective } from './scroll-tracker.directive';
import { ScrollTrackerService } from './scroll-tracker.service';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		ScrollTrackerDirective
	],
	exports: [
		ScrollTrackerDirective
	]
})
export class ScrollTrackerModule {

	/**
	 * Guaranteed singletons for provided Services across App.
	 *
	 * @return 				An Angular Module with Providers
	 */
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: ScrollTrackerModule,
			providers: [
				ScrollTrackerService
			]
		}
	}
}
