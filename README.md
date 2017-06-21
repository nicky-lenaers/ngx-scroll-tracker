# ngx-scroll-tracker

Track any element to enhance scroll-based features in you app.<br>
Works for **Angular 4+**, both **AoT** and **SSR**.

## Installation
```sh
$ npm install @nicky-lenaers/ngx-scroll-tracker
```

## Usage
#### 1. Import the Angular Module
```ts
import { NgModule } from '@angular/core';
import { ScrollTrackerModule } from '@nicky-lenaers/ngx-scroll-tracker';

@NgModule({
  imports: [
    ...
    ScrollTrackerModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 2. Apply Angular Directive
```html
...
<div (ngx-scroll-tracker)="handler($event)">
  <h1>Lorem Ipsum</h1>
  <p>Dolor sit amet</p>
</div>
```

#### 3. Handle Scroll Tracker Events
```ts
import { Component } from '@angular/core';
import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';

@Component({})
export class MyComponent {

  public handler(eventData: ScrollTrackerEventData) {
    // Use the eventData!
  }
}
```

## Data API
The `ScrollTrackerEventData` interface defines the data being emitted from the tracker. First-level properties:

| Property     | Description                           |
|--------------|---------------------------------------|
| `$event`     | Native Browser Event                  |
| `elementRef` | Angular ElementRef to tracked Element |
| `data`       | The scroll data for the Element       |
|              |                                       |

The `data` property holds the following properties:

| Property                            | Description                                                                                                      |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `elementTop.fromContainerTop`       | Distance between the top of the tracked element and the top of its scrollable container (pixels and ratio)       |
| `elementTop.fromContainerBottom`    | Distance between the top of the tracked element and the bottom of its scrollable container (pixels and ratio)    |
| `elementBottom.fromContainerTop`    | Distance between the bottom of the tracked element and the top of its scrollable container (pixels and ratio)    |
| `elementBottom.fromContainerBottom` | Distance between the bottom of the tracked element and the bottom of its scrollable container (pixels and ratio) |

#### Notes
* Negative values for both `pixels` and `ratio` means the element has scrolled **past** its contianer treshold (`.fromContainerTop` etc.).
* Positive values for both `pixels` and `ratio` means the element has **not** yet reached its container tresheld.

#### Example
```ts
import { Component } from '@angular/core';
import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';

@Component({})
export class MyComponent {

  public handler(eventData: ScrollTrackerEventData) {

    if (eventData.data.elementTop.fromContainerTop.ratio < 0) {
      console.log('Element Top is past Containter Top');
    }
    if (eventData.data.elementBottom.fromContainerBottom.ratio < 0) {
      console.log('Element Bottom is past Containter Bottom');
    }
    if (eventData.data.elementTop.fromContainerTop.pixels < 200) {
      console.log('Element Top is 200px from Containter Top');
    }
    if (eventData.data.elementTop.fromContainerTop.ratio > 0.25) {
      console.log('Element Top is past Containter Top');
    }

  }
}
```
