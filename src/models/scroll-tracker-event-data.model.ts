import { ElementRef } from '@angular/core';

export interface ɵScrollTrackerEventDataOptions {
	pixels: number;
	ratio: number;
}
export interface ɵScrollTrackerEventDataElement {
	fromContainerTop: ɵScrollTrackerEventDataOptions;
	fromContainerBottom: ɵScrollTrackerEventDataOptions;
}
export interface ɵScrollTrackerEventScrollData {
	elementTop: ɵScrollTrackerEventDataElement;
	elementBottom: ɵScrollTrackerEventDataElement;

}
export interface ScrollTrackerEventData {
	$event: Event;
	elementRef: ElementRef;
	data: ɵScrollTrackerEventScrollData;
}

