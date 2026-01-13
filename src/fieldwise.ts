import { useEffect, useState, useCallback, useMemo } from 'react';
import { Form } from './Form';
import logFormEvents from './logFormEvents';
import changeHandlers from './changeHandlers';
import errorHandlers from './errorHandlers';

import type { Values, FieldSet, EmitFn, FieldUnsubscribeFn } from './Form';

type EmitFnEnhanced<T extends Values> = EmitFn<T> & {
  later: EmitFn<T>;
};

type FormCommons<T extends Values> = {
  emit: EmitFnEnhanced<T>;
  once: typeof Form.prototype.once;
  isTouched: boolean;
  isValidating: boolean;
  i: <K extends keyof T>(key: K) => InputProps<K, T[K]>;
};

type InputProps<K, T> = {
  name: K;
  value: T;
  onChange: (value: T) => void;
  error: string | null;
};
type FormHooks<T extends Values> = {
  useSlice<K extends keyof T>(
    keys: readonly K[]
  ): FormCommons<T> & { fields: FieldSet<Pick<T, K>> };
  useForm(): FormCommons<T> & { fields: FieldSet<T> };
};

type PluginFunction<T extends Values, TArgs extends unknown[] = []> = (
  form: Form<T>,
  ...args: TArgs
) => void;

export class FormBuilder<T extends Values> {
  private form: Form<T>;

  constructor(initialValues: T) {
    this.form = new Form<T>(initialValues);
    if (Form.debugMode) {
      logFormEvents(this.form);
    }
    changeHandlers(this.form);
    errorHandlers(this.form);
  }

  get useSlice(): FormHooks<T>['useSlice'] {
    return (keys) => {
      const [fields, setFields] = useState(() => this.form.getSlice(keys));
      const [isValidating, setIsValidating] = useState(this.form.isValidating);

      useEffect(() => {
        const unsubscribers: FieldUnsubscribeFn[] = [];
        let pendingUpdate = false;
        let pendingValidationUpdate = false;

        const scheduleUpdate = () => {
          if (!pendingUpdate) {
            pendingUpdate = true;
            queueMicrotask(() => {
              pendingUpdate = false;
              setFields(this.form.getSlice(keys));
            });
          }
        };

        const scheduleValidationUpdate = (isValidating: boolean) => {
          if (!pendingValidationUpdate) {
            pendingValidationUpdate = true;
            queueMicrotask(() => {
              pendingValidationUpdate = false;
              setIsValidating(isValidating);
            });
          }
        };

        keys.forEach((key) => {
          const unsubscribe = this.form.subscribeField(key, scheduleUpdate);
          unsubscribers.push(unsubscribe);
        });

        const unsubscribeValidationStart = this.form.on('validationStart', () =>
          scheduleValidationUpdate(true)
        );
        const unsubscribeValidated = this.form.on('validated', () => {
          scheduleValidationUpdate(false);
        });

        return () => {
          unsubscribers.forEach((unsubscribe) => unsubscribe());
          unsubscribeValidationStart();
          unsubscribeValidated();
        };
      }, [keys]);

      const emit: EmitFnEnhanced<T> = useMemo(() => {
        const emitFn = this.form.emit.bind(this.form);

        return Object.assign(emitFn, {
          later: this.form.emitLater.bind(this.form)
        });
      }, []);
      const once = useMemo(() => this.form.once.bind(this.form), []);
      const isTouched = useMemo(() => {
        return keys.some((key) => this.form.get(key).isTouched);
      }, [keys]);

      const inputProps = useCallback(
        <K extends keyof T>(name: K): InputProps<K, T[K]> => {
          return {
            name,
            value: this.form.getValue(name),
            onChange: (value: T[K]) => {
              this.form.emit('change', name, value);
            },
            error: this.form.get(name).error
          };
        },
        []
      );

      return { fields, isTouched, isValidating, emit, once, i: inputProps };
    };
  }

  get useForm(): FormHooks<T>['useForm'] {
    return () => {
      const allKeys = Object.keys(this.form['initialValues']) as (keyof T)[];

      return this.useSlice(allKeys) as FormCommons<T> & { fields: FieldSet<T> };
    };
  }

  use<TArgs extends unknown[]>(
    plugin: PluginFunction<T, TArgs>,
    ...args: TArgs
  ): FormBuilder<T> {
    plugin(this.form, ...args);
    return this;
  }

  hooks(): FormHooks<T> {
    return {
      useSlice: this.useSlice,
      useForm: this.useForm
    };
  }
}

export const fieldwise = <T extends Values>(
  initialValues: T
): FormBuilder<T> => {
  return new FormBuilder<T>(initialValues);
};

export const getValues = <T extends Values>(fields: Form<T>['fields']): T => {
  return Object.entries(fields).reduce((acc, [key, field]) => {
    acc[key as keyof T] = field.value;
    return acc;
  }, {} as T);
};
