import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { assert } from 'console';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    it('should set params to true', () => {
      component.params = undefined;

      component.open();

      expect(component.params).toBeTrue();
    });
  });

  describe('close', () => {
    it('should set params to undefined', () => {
      component.params = { value: 'test' };

      component.close();

      expect(component.params).toBeUndefined();
    });
  });
});
