import { Injectable, ElementRef, Renderer2 } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { ScrollTrackerEventData } from './models/scroll-tracker-event-data.model';
import { ScrollTrackerContainerManager } from './models/scroll-tracker-container-manager.model';

@Injectable()
export class ScrollTrackerService {

	private _container_manager: ScrollTrackerContainerManager;

	constructor() {
		this._container_manager = new Map();
	}

	/**
	 * Register a new Element to be tracked for scrolling.
	 *
	 * @param element_ref 			The Element Reference
	 * @param renderer2 			The Angular RendererV2
	 * @returns 					An RxJS Observable
	 */
	public register(element_ref: ElementRef, renderer2: Renderer2): Observable<any> {

		let container = this._getFirstScrollableParentNode(element_ref.nativeElement);

		if (!this._container_manager.has(container)) {

			this._container_manager.set(container, {
				children: new Map(),
				listener: (event) => this._isElementInContainerView(event, container)
			});

			const container_listener = this._container_manager.get(container).listener;

			renderer2.listen(this._getListenerTarget(container), 'scroll', container_listener);
			renderer2.listen(this._getListenerTarget(container), 'resize', container_listener);
		}

		// Observable Element Source
		let element_source$ = new ReplaySubject<ScrollTrackerEventData>();

		// Push Element to its Container
		this._container_manager
			.get(container)
			.children
			.set(element_ref, element_source$);

		// Initial Test
		this._isElementInContainerView(new Event('ngx-scroll-tracker-initial-event'), container);

		// Return Observable
		return element_source$.asObservable();
	}

	/**
	 * Retrieves the Listener target.
	 *
	 * @param container 				The HTML Container Element
	 * @returns 						The Listener Object
	 */
	private _getListenerTarget(container: HTMLElement): HTMLElement | Window {
		return container.tagName === 'BODY' ? window : container;
	}

	/**
	 * Evaluate whether the registered Element is in the view or not.
	 *
	 * @param container 				The Container the Element belongs to
	 * @returns void
	 */
	private _isElementInContainerView(event: Event, container: HTMLElement): void {

		let container_rect: ClientRect = container.getBoundingClientRect();

		this._container_manager.get(container).children.forEach((child_value, child_key, map) => {

			// Set Element Rectangle
			let element_rect: ClientRect = child_key.nativeElement.getBoundingClientRect();
			const element_height = element_rect.bottom - element_rect.top;

			// Set Container Height and Top
			const container_height = this._isWindow(this._getListenerTarget(container)) ? window.innerHeight : (container_rect.bottom - container_rect.top);
			const container_top = this._isWindow(this._getListenerTarget(container)) ? 0 : container_rect.top;

			// Set Event Data
			let event_data: ScrollTrackerEventData = {
				$event: event,
				elementRef: child_key,
				data: {
					elementTop: {
						fromContainerTop: {
							pixels: element_rect.top - container_top,
							ratio: (element_rect.top - container_top) / container_height
						},
						fromContainerBottom: {
							pixels: element_rect.top - (container_height + container_top),
							ratio: (element_rect.top - (container_height + container_top)) / container_height
						}
					},
					elementBottom: {
						fromContainerTop: {
							pixels: (element_rect.top + element_height) - container_top,
							ratio: ((element_rect.top + element_height) - container_top) / container_height
						},
						fromContainerBottom: {
							pixels: (element_rect.top + element_height) - (container_height + container_top),
							ratio: ((element_rect.top + element_height) - (container_height + container_top)) / container_height
						}
					}
				}
			}

			// Emit Value
			this._container_manager
				.get(container)
				.children
				.get(child_key)
				.next(event_data);
		});
	}

	/**
	 * Test if a given Element is the Window.
	 *
	 * @param container 				The given Element
	 * @returns 						Boolean if given Element is Window
	 */
	private _isWindow(container: HTMLElement | Window): container is Window {
		return container === window;
	}

	/**
	 * Find the first scrollable parent node of an element.
	 *
	 * @param nativeElement 			The element to search from
	 * @param includeHidden 			Whether to include hidden elements or not
	 * @returns 						The first scrollable parent node
	 */
	private _getFirstScrollableParentNode(nativeElement: HTMLElement, includeHidden: boolean = true): HTMLElement {

		let style: CSSStyleDeclaration = window.getComputedStyle(nativeElement);

		const overflow_regex: RegExp = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

		if (style.position === 'fixed') throw new Error(`Scroll item cannot be positioned 'fixed'`);

		// Recursive Loop Parents
		for (let parent = nativeElement; parent = parent.parentElement;) {

			// Recalculate Style
			style = window.getComputedStyle(parent);

			// Skip Absolute Positioning
			if (style.position === 'absolute') continue;

			// Return Body
			if (parent.tagName === 'BODY') return parent;

			// Test Overflow
			if (overflow_regex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
		}

		throw new Error(`No scrollable parent found for element ${nativeElement}`);
	}

	/**
	 * Unregisters an Element from being tracked for scrolling.
	 *
	 * @param element  			The Element to unregister
	 * @returns void
	 */
	private _unregister(element: ElementRef): void {

		this._container_manager.forEach((container_value, container_key, container_map) => {

			container_value.children.forEach((child_value, child_key, element_map) => {

				if (child_key.nativeElement === element.nativeElement) {

					// Remove Element from Container
					this._container_manager.get(container_key).children.delete(child_key);

					// No more Element to be tracked
					if (this._container_manager.get(container_key).children.size === 0) {

						// Cleanup
						this._container_manager.delete(container_key);
					}
				}
			});
		});
	}
}
