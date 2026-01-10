import { describe, it, expect, vi } from 'vitest';
import { FormBuilder } from '../fieldwise';

describe('Form', () => {
  describe('initialization', () => {
    it('should initialize with provided values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const builder = new FormBuilder(initialValues);
      const form = (builder as any).form;

      expect(form.getValues()).toEqual(initialValues);
    });

    it('should set all fields as not touched initially', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      expect(form.get('name').isTouched).toBe(false);
      expect(form.get('email').isTouched).toBe(false);
    });

    it('should set all field errors to null initially', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      expect(form.get('name').error).toBe(null);
      expect(form.get('email').error).toBe(null);
    });
  });

  describe('change event', () => {
    it('should update field value on change', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      form.emit('change', 'name', 'Jane');

      expect(form.getValue('name')).toBe('Jane');
    });

    it('should mark field as touched on change', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      form.emit('change', 'name', 'Jane');

      expect(form.get('name').isTouched).toBe(true);
    });

    it('should trigger change event listeners', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;
      const listener = vi.fn();

      form.on('change', listener);
      form.emit('change', 'name', 'Jane');

      expect(listener).toHaveBeenCalledWith('name', 'Jane');
    });

    it('should notify field subscribers', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;
      const subscriber = vi.fn();

      form.subscribeField('name', subscriber);
      form.emit('change', 'name', 'Jane');

      expect(subscriber).toHaveBeenCalled();
    });
  });

  describe('changeSome event', () => {
    it('should update multiple fields at once', () => {
      const builder = new FormBuilder({ name: '', email: '', age: 0 });
      const form = (builder as any).form;

      form.emit('changeSome', { name: 'Jane', email: 'jane@example.com' });

      expect(form.getValue('name')).toBe('Jane');
      expect(form.getValue('email')).toBe('jane@example.com');
      expect(form.getValue('age')).toBe(0);
    });

    it('should mark updated fields as touched', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      form.emit('changeSome', { name: 'Jane' });

      expect(form.get('name').isTouched).toBe(true);
      expect(form.get('email').isTouched).toBe(false);
    });
  });

  describe('reset event', () => {
    it('should reset to initial values', () => {
      const builder = new FormBuilder({
        name: 'John',
        email: 'john@example.com'
      });
      const form = (builder as any).form;

      form.emit('change', 'name', 'Jane');
      form.emit('reset');

      expect(form.getValue('name')).toBe('John');
    });

    it('should reset to provided snapshot', () => {
      const builder = new FormBuilder({
        name: 'John',
        email: 'john@example.com'
      });
      const form = (builder as any).form;

      form.emit('reset', { name: 'Jane', email: 'jane@example.com' });

      expect(form.getValue('name')).toBe('Jane');
      expect(form.getValue('email')).toBe('jane@example.com');
    });

    it('should clear touched state', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      form.emit('change', 'name', 'Jane');
      expect(form.get('name').isTouched).toBe(true);

      form.emit('reset');

      expect(form.get('name').isTouched).toBe(false);
    });

    it('should clear errors', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      form.emit('errors', { name: 'Required' });
      expect(form.get('name').error).toBe('Required');

      form.emit('reset');

      expect(form.get('name').error).toBe(null);
    });
  });

  describe('once method', () => {
    it('should trigger handler only once', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;
      const handler = vi.fn();

      form.once('change', handler);
      form.emit('change', 'name', 'First');
      form.emit('change', 'name', 'Second');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('name', 'First');
    });
  });

  describe('field subscriptions', () => {
    it('should notify subscriber when field changes', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;
      const subscriber = vi.fn();

      form.subscribeField('name', subscriber);
      form.emit('change', 'name', 'Jane');

      expect(subscriber).toHaveBeenCalled();
    });

    it('should not notify subscriber for other field changes', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;
      const subscriber = vi.fn();

      form.subscribeField('name', subscriber);
      form.emit('change', 'email', 'jane@example.com');

      expect(subscriber).not.toHaveBeenCalled();
    });

    it('should allow unsubscribing', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;
      const subscriber = vi.fn();

      const unsubscribe = form.subscribeField('name', subscriber);
      unsubscribe();
      form.emit('change', 'name', 'Jane');

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe('getSlice', () => {
    it('should return only requested fields', () => {
      const builder = new FormBuilder({
        name: 'John',
        email: 'john@example.com',
        age: 30
      });
      const form = (builder as any).form;

      const slice = form.getSlice(['name', 'email']);

      expect(slice).toHaveProperty('name');
      expect(slice).toHaveProperty('email');
      expect(slice).not.toHaveProperty('age');
    });

    it('should include field metadata', () => {
      const builder = new FormBuilder({ name: 'John' });
      const form = (builder as any).form;

      const slice = form.getSlice(['name']);

      expect(slice.name).toHaveProperty('value', 'John');
      expect(slice.name).toHaveProperty('error', null);
      expect(slice.name).toHaveProperty('isTouched', false);
    });
  });
});
