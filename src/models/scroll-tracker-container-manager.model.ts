import { ElementRef } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ScrollTrackerEventData } from './scroll-tracker-event-data.model';

export interface ɵScrollTrackerContainer {
	children: Map<ElementRef, ReplaySubject<ScrollTrackerEventData>>;
	listener(event: Event): void;
}
export type ScrollTrackerContainerManager = Map<HTMLElement, ɵScrollTrackerContainer>;
