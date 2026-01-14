import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fieldwise, getValues } from '../fieldwise';

describe('fieldwise - Advanced Features', () => {
  describe('isTouched computed value', () => {
    it('should return false when no fields in slice are touched', () => {
      const { useSlice } = fieldwise({ name: '', email: '', age: 0 }).hooks();
      const { result } = renderHook(() => useSlice(['name', 'email']));

      expect(result.current.isTouched).toBe(false);
    });

    it('should return true when any field in slice is touched', async () => {
      const { useSlice } = fieldwise({ name: '', email: '', age: 0 }).hooks();
      const { result } = renderHook(() => useSlice(['name', 'email']));

      await act(async () => {
        result.current.emit('touch', 'name');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isTouched).toBe(true);
    });

    it('should reflect isTouched for fields in useForm', async () => {
      const { useForm } = fieldwise({ name: '', email: '' }).hooks();
      const { result } = renderHook(() => useForm());

      expect(result.current.isTouched).toBe(false);

      await act(async () => {
        result.current.emit('change', 'name', 'Test');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isTouched).toBe(true);
    });
  });

  describe('emit.later', () => {
    it('should expose emitLater via emit.later', async () => {
      const { useForm } = fieldwise({ name: '' }).hooks();
      const { result } = renderHook(() => useForm());

      expect(typeof result.current.emit.later).toBe('function');
    });

    it('should emit events asynchronously via emit.later', async () => {
      const { useForm } = fieldwise({ name: '' }).hooks();
      const { result } = renderHook(() => useForm());

      let handlerCalled = false;

      await act(async () => {
        result.current.once('change', () => {
          handlerCalled = true;
        });

        result.current.emit.later('change', 'name', 'Async');

        // Should not be called immediately
        expect(handlerCalled).toBe(false);

        // Wait for next tick
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(handlerCalled).toBe(true);
      });
    });
  });

  describe('isValidating state', () => {
    it('should track isValidating during async validation', async () => {
      const builder = new (fieldwise({ name: '' }) as any).constructor({
        name: ''
      });

      // Register async validator at builder level
      builder.form.registerValidator(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return null;
      });

      const { useForm } = builder.hooks();
      const { result } = renderHook(() => useForm());

      expect(result.current.isValidating).toBe(false);

      await act(async () => {
        result.current.emit('validate');
        await new Promise((resolve) => setTimeout(resolve, 5));
      });

      // During validation
      expect(result.current.isValidating).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // After validation completes
      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('getValues utility', () => {
    it('should extract values from fields object', () => {
      const fields = {
        name: { value: 'John', error: null, isTouched: true },
        email: {
          value: 'john@example.com',
          error: 'Invalid',
          isTouched: false
        },
        age: { value: 30, error: null, isTouched: true }
      };

      const values = getValues(fields as any);

      expect(values).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: 30
      });
    });

    it('should work with empty fields', () => {
      const fields = {};
      const values = getValues(fields as any);

      expect(values).toEqual({});
    });
  });

  describe('input helper edge cases', () => {
    it('should maintain reference stability', () => {
      const { useForm } = fieldwise({ name: '' }).hooks();
      const { result, rerender } = renderHook(() => useForm());

      const firstI = result.current.i;
      rerender();
      const secondI = result.current.i;

      // i function should maintain reference
      expect(firstI).toBe(secondI);
    });

    it('should work with non-primitive values', async () => {
      type FormValues = {
        tags: string[];
      };

      const { useForm } = fieldwise<FormValues>({ tags: [] }).hooks();
      const { result } = renderHook(() => useForm());

      await act(async () => {
        result.current.i('tags').onChange(['tag1', 'tag2']);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.fields.tags.value).toEqual(['tag1', 'tag2']);
    });
  });

  describe('slice subscription edge cases', () => {
    it('should not re-render when unsubscribed field changes', async () => {
      const { useSlice } = fieldwise({ name: '', email: '', age: 0 }).hooks();

      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useSlice(['name']);
      });

      const initialRenderCount = renderCount;

      // Change field not in slice
      await act(async () => {
        result.current.emit('change', 'email', 'test@example.com');
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // Should not cause re-render
      expect(renderCount).toBe(initialRenderCount);

      // Change field in slice
      await act(async () => {
        result.current.emit('change', 'name', 'John');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should cause re-render
      expect(renderCount).toBeGreaterThan(initialRenderCount);
    });

    it('should handle validationStart and validated events', async () => {
      const builder = new (fieldwise({ name: '' }) as any).constructor({
        name: ''
      });

      // Register validator before creating hooks
      builder.form.registerValidator(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return null;
      });

      const { useSlice } = builder.hooks();
      const { result } = renderHook(() => useSlice(['name']));

      expect(result.current.isValidating).toBe(false);

      await act(async () => {
        result.current.emit('validate');
        await new Promise((resolve) => setTimeout(resolve, 2));
      });

      expect(result.current.isValidating).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup subscriptions on unmount', () => {
      const { useForm } = fieldwise({ name: '' }).hooks();
      const { unmount } = renderHook(() => useForm());

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should cleanup validation subscriptions on unmount', () => {
      const { useSlice } = fieldwise({ name: '' }).hooks();
      const { unmount } = renderHook(() => useSlice(['name']));

      expect(() => unmount()).not.toThrow();
    });
  });
});
