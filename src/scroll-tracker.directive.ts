import { Directive, Inject, ElementRef, EventEmitter, Output, AfterContentInit, Renderer2, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ScrollTrackerService } from './scroll-tracker.service';
import { ScrollTrackerEventData } from './models/scroll-tracker-event-data.model';

@Directive({
	selector: '[ngx-scroll-tracker]'
})
export class ScrollTrackerDirective implements AfterContentInit, OnDestroy {

	private _subscription: Subscription;

	@Output('ngx-scroll-tracker') ngxScrollTrackerHandler: EventEmitter<any> = new EventEmitter();

	constructor(
		private _element_ref: ElementRef,
		private _scrollTrackerService: ScrollTrackerService,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document: any,
		@Inject(PLATFORM_ID) private _platform_id: any
	) {
	}

	/**
	 * Angular Lifecycle Hook - After Content Init
	 * @source https://angular.io/api/core/AfterContentInit
	 *
	 * @returns void
	 */
	public ngAfterContentInit(): void {

		if (isPlatformServer(this._platform_id)) return;

		// Kicks off the next Angular Lifecycle
		setTimeout((__HACK__: any) => {

			// Subscribe to Scroll Events...
			this._subscription = this._scrollTrackerService
				.register(this._element_ref, this._renderer2)
				.finally(() => this._cleanup())
				.subscribe(
					(value: ScrollTrackerEventData) => this.ngxScrollTrackerHandler.emit(value),
					(error) => console.error(error)
				);
		})
	}

	/**
	 * Angular Lifecycle Hook - On Destroy
	 * @source https://angular.io/api/core/OnDestroy
	 *
	 * @returns void
	 */
	public ngOnDestroy(): void {
		if (isPlatformServer(this._platform_id)) return;
		this._cleanup();
	}

	/**
	 * Clean up subscription.
	 *
	 * @return void
	 */
	private _cleanup(): void {
		this._subscription.unsubscribe();
	}

}
