import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { PublicLayout } from './core/layout/public-layout/public-layout';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, PublicLayout],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render header and footer in the public layout', async () => {
    const fixture = TestBed.createComponent(PublicLayout);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-site-header')).toBeTruthy();
    expect(compiled.querySelector('app-site-footer')).toBeTruthy();
  });
});
