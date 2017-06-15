import { Directive, Inject, ElementRef, EventEmitter, Output, AfterViewInit, Renderer2, OnDestroy, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { ScrollTrackerService, ScrollTrackerEventData } from './scroll-tracker.service';
import { Subscription } from 'rxjs';
import { isPlatformServer } from '@angular/common';

@Directive({
	selector: '[ngx-scroll-tracker]'
})
export class ScrollTrackerDirective implements AfterViewInit, OnDestroy {

	private _subscription: Subscription;

	@Output('ngx-scroll-tracker') ngxScrollTrackerOnScroll: EventEmitter<any> = new EventEmitter();

	constructor(
		private _element_ref: ElementRef,
		private _scrollTrackerService: ScrollTrackerService,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document: any,
		@Inject(PLATFORM_ID) private _platform_id: any
	) {
	}

	public ngAfterViewInit(): void {

		if (isPlatformServer(this._platform_id)) return;

		// Subscribe to Scroll Events...
		this._subscription = this._scrollTrackerService
			.register(this._element_ref, this._renderer2)
			.finally(() => this._cleanup())
			.subscribe(
				(value: ScrollTrackerEventData) => this.ngxScrollTrackerOnScroll.emit(value),
				(error) => console.error(error)
			);
	}

	/**
	 * Angular Done
	 *
	 * @return void
	 */
	public ngOnDestroy(): void {
		if (isPlatformServer(this._platform_id)) return;
		this._cleanup();
	}

	/**
	 * Clean up all references.
	 *
	 * @return void
	 */
	private _cleanup(): void {
		this._subscription.unsubscribe();
	}

}
