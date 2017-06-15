import { Injectable, ElementRef, Renderer2 } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';

export interface ScrollTrackerEventDataOptions {
	pixels: number;
	ratio: number;
}
export interface ScrollTrackerEventData {
	top: ScrollTrackerEventDataOptions;
	bottom: ScrollTrackerEventDataOptions;
}

interface Container {
	children: Map<ElementRef, ReplaySubject<ScrollTrackerEventData>>;
	listener(event: any): void;
}
type ContainerManager = Map<HTMLElement, Container>;

@Injectable()
export class ScrollTrackerService {

	private _container_manager: ContainerManager;

	constructor() {
		this._container_manager = new Map();
	}

	/**
	 * Register a new Element to be tracked for scrolling.
	 *
	 * @param element_ref 			The Element Reference
	 * @param renderer2 			The Angular RendererV2
	 * @return 						An Observable
	 */
	public register(element_ref: ElementRef, renderer2: Renderer2): Observable<any> {

		let container = this._getFirstScrollableParent(element_ref.nativeElement);

		if (!this._container_manager.has(container)) {

			this._container_manager.set(container, {
				children: new Map(),
				listener: (evt) => this._isElementInContainerView(container, element_ref)
			});

			const cont = this._container_manager.get(container);

			renderer2.listen(this._getListenerTarget(container), 'scroll', this._container_manager.get(container).listener);
			renderer2.listen(this._getListenerTarget(container), 'resize', this._container_manager.get(container).listener);
		}

		// Observable Element Source
		let element_source$ = new ReplaySubject();

		// Push Element to its Container
		this._container_manager
			.get(container)
			.children
			.set(element_ref, element_source$);

		// Initial Test
		if (container.scrollTop === 0) this._isElementInContainerView(container, element_ref);

		// Return Observable
		return element_source$.asObservable();
	}

	/**
	 * Retrieves the Listener target.
	 *
	 * @param container 				The HTML Container element
	 */
	private _getListenerTarget(container: HTMLElement): HTMLElement | Window {
		return container.tagName === 'BODY' ? window : container;
	}

	/**
	 * Evaluate whether the registered Element is in the view or not.
	 *
	 * @param container 				The Container the Element belongs to
	 * @return 							Void
	 */
	private _isElementInContainerView(container: HTMLElement, element_ref: ElementRef): void {

		let container_rect: ClientRect = container.getBoundingClientRect();

		this._container_manager.get(container).children.forEach((child_value, child_key, map) => {

			// Set Element Rectangle
			let element_rect: ClientRect = child_key.nativeElement.getBoundingClientRect();
			const element_height = element_rect.bottom - element_rect.top;

			// Set Container Width & Height
			const container_width = this._isWindow(container) ? container.outerWidth : container_rect.right - container_rect.left;
			const container_height = this._isWindow(container) ? container.outerHeight : container_rect.bottom - container_rect.top;

			// Emit Value
			this._container_manager
				.get(container)
				.children
				.get(child_key)
				.next({
					top: {
						pixels: container_height - element_rect.top,
						ratio: (container_height - element_rect.top) / container_height
					},
					bottom: {
						pixels: (container_height - element_rect.top) - element_height,
						ratio: ((container_height - element_rect.top) - element_height) / container_height
					}
				});
		});
	}

	/**
	 * Test if a given HTML Element is the Window.
	 *
	 * @param container 				The given HTML Element
	 * @returns 						Boolean if given HTML Element is Window
	 */
	private _isWindow(container: HTMLElement | Window): container is Window {
		return container === window;
	}

	/**
	 * Find the first scrollable parent node of an element.
	 *
	 * @param nativeElement 			The element to search from
	 * @param includeHidden 			Whether to include hidden elements or not
	 * @return 							The first scrollable parent element
	 */
	private _getFirstScrollableParent(nativeElement: HTMLElement, includeHidden: boolean = true): HTMLElement {

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
	 * @return 					Void
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
