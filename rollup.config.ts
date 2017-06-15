export default {
    entry: 'dist/index.js',
    dest: 'dist/bundles/ngx-scroll-tracker.umd.js',
    sourceMap: false,
    format: 'umd',
    moduleName: 'ng.ngx-scroll-tracker',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        'rxjs/Observable': 'Rx',
        'rxjs/ReplaySubject': 'Rx'
    },
    external: [
        '@angular/core',
        '@angular/common',
		'rxjs'
    ]
}
