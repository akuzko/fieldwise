export type Field<T> = {
  value: T;
  error: string | null;
  isTouched: boolean;
};
export type FieldSet<T extends Values> = {
  [K in keyof T]: Field<T[K]>;
};

export type FieldSubscriber<T> = (field: Field<T>) => void;
export type FieldUnsubscribeFn = () => void;

export type EventHandler<TArgs extends unknown[] = []> = (
  ...args: TArgs
) => void;
export type EventUnsubscribeFn = () => void;
export type Values = Record<string, unknown>;
export type Errors<T extends Values> = Partial<Record<keyof T, string>>;
export type EventMap<T extends Values> = {
  change: [key: keyof T, value: T[keyof T]];
  changeMany: [payload: Partial<T>];
  touch: [key: keyof T];
  touchMany: [keys: (keyof T)[]];
  reset: [snapshot?: T];
  errors: [errors: Errors<T>];
  validate: [];
  validated: [values: T, errors: Errors<T> | null];
  validationStart: [];
};

export type EmitFn<T extends Values> = <K extends keyof EventMap<T>>(
  event: K,
  ...args: EventMap<T>[K]
) => void;

export type DebugMode = boolean | DebugModeConfig;
export type DebugModeConfig = {
  only: (keyof EventMap<Values>)[];
};

export class Form<T extends Values> {
  public static debugMode: DebugMode = false;
  public initialValues: T;
  public isValidating: boolean = false;
  private fields: FieldSet<T>;
  private fieldSubscribers: Map<keyof T, Set<FieldSubscriber<T[keyof T]>>> =
    new Map();
  private validators: Array<
    (values: T) => Errors<T> | null | Promise<Errors<T> | null>
  > = [];

  private eventHandlers: Map<
    keyof EventMap<T>,
    Set<(...args: EventMap<T>[keyof EventMap<T>]) => void>
  > = new Map();

  private eventQueue: Map<
    keyof EventMap<T>,
    Array<EventMap<T>[keyof EventMap<T>]>
  > = new Map();

  constructor(initialValues: T) {
    this.initialValues = initialValues;
    this.fields = this.valuesToFields(initialValues);

    // Set up validation handler
    this.on('validate', () => {
      this.runValidation();
    });
  }

  registerValidator(
    validator: (values: T) => Errors<T> | null | Promise<Errors<T> | null>
  ): void {
    this.validators.push(validator);
  }

  getValue<K extends keyof T>(key: K): T[K] {
    return this.fields[key].value;
  }

  getValues(): T {
    return Object.entries(this.fields).reduce((acc, [key, field]) => {
      acc[key as keyof T] = field.value;
      return acc;
    }, {} as T);
  }

  get<K extends keyof T>(key: K): Field<T[K]> {
    return this.fields[key];
  }

  setValue<K extends keyof T>(key: K, value: T[K]): void {
    if (key in this.fields && this.fields[key].value !== value) {
      this.fields[key].value = value;
      this.fields[key].error = null;
      this.fields[key].isTouched = true;
      this.notify(key, this.fields[key]);
    }
  }

  setValues(newValues: Partial<T>): void {
    (Object.keys(newValues) as (keyof T)[]).forEach((key) => {
      this.setValue(key, newValues[key] as T[keyof T]);
    });
  }

  touch<K extends keyof T>(key: K): void {
    const field = this.fields[key];
    if (!field.isTouched) {
      field.isTouched = true;
      this.notify(key, field);
    }
  }

  setError<K extends keyof T>(key: K, error: string | null): void {
    if (this.fields[key].error !== error) {
      this.fields[key].error = error;
      this.notify(key, this.fields[key]);
    }
  }

  setErrors(newErrors: Partial<Record<keyof T, string>>): void {
    (Object.keys(this.fields) as (keyof T)[]).forEach((key) => {
      this.setError(key, newErrors[key] || null);
    });
  }

  reset(snapshot: T): void {
    this.fields = this.valuesToFields(snapshot);
    Object.entries(this.fields).forEach(([name, field]) => {
      this.notify(name, field);
    });
  }

  getSlice<K extends keyof T>(keys: readonly K[]): Pick<FieldSet<T>, K> {
    return keys.reduce((acc, key) => {
      acc[key] = this.fields[key];
      return acc;
    }, {} as Pick<FieldSet<T>, K>);
  }

  subscribeField<K extends keyof T>(
    key: K,
    callback: FieldSubscriber<T[K]>
  ): FieldUnsubscribeFn {
    if (!this.fieldSubscribers.has(key)) {
      this.fieldSubscribers.set(key, new Set());
    }

    const subscribers = this.fieldSubscribers.get(key)!;
    subscribers.add(callback as FieldSubscriber<T[keyof T]>);

    return () => {
      subscribers.delete(callback as FieldSubscriber<T[keyof T]>);
    };
  }

  on<E extends keyof EventMap<T>>(
    event: E,
    handler: EventHandler<EventMap<T>[E]>
  ): EventUnsubscribeFn {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler as (...args: EventMap<T>[keyof EventMap<T>]) => void);

    // Process queued events when first handler is added
    this.processQueuedEvents(event);

    return () => {
      handlers.delete(
        handler as (...args: EventMap<T>[keyof EventMap<T>]) => void
      );
    };
  }

  once<E extends keyof EventMap<T>>(
    event: E,
    handler: EventHandler<EventMap<T>[E]>
  ): void {
    const wrapper = (...args: EventMap<T>[E]) => {
      handler(...args);
      this.eventHandlers
        .get(event)
        ?.delete(wrapper as (...args: EventMap<T>[keyof EventMap<T>]) => void);
    };

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers
      .get(event)!
      .add(wrapper as (...args: EventMap<T>[keyof EventMap<T>]) => void);

    // Process queued events when first handler is added
    this.processQueuedEvents(event);
  }

  emit: EmitFn<T> = (event, ...args) => {
    this.doEmit(event, ...args);
  };

  emitLater: EmitFn<T> = (event, ...args) => {
    setTimeout(() => {
      this.doEmit(event, ...args);
    }, 0);
  };

  private doEmit<E extends keyof EventMap<T>>(
    event: E,
    ...args: EventMap<T>[E]
  ): void {
    const handlers = this.eventHandlers.get(event);

    if (!handlers || handlers.size === 0) {
      // Queue event if no handlers exist
      if (!this.eventQueue.has(event)) {
        this.eventQueue.set(event, []);
      }
      this.eventQueue.get(event)!.push(args);
    } else {
      // Emit to handlers immediately
      handlers.forEach((handler) => {
        handler(...args);
      });
    }
  }

  private processQueuedEvents<E extends keyof EventMap<T>>(event: E): void {
    const queue = this.eventQueue.get(event);
    if (!queue || queue.length === 0) return;

    const handlers = this.eventHandlers.get(event);

    // Process all queued events in FIFO order while handlers exist
    while (queue.length > 0 && handlers && handlers.size > 0) {
      const args = queue.shift()!;
      handlers.forEach((handler) => {
        handler(...args);
      });
    }

    // Clean up empty queue
    if (queue.length === 0) {
      this.eventQueue.delete(event);
    }
  }

  private notify<K extends keyof T>(key: K, field: Field<T[K]>): void {
    const subscribers = this.fieldSubscribers.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => {
        callback(field);
      });
    }
  }

  private valuesToFields(values: T): FieldSet<T> {
    return Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: values[key as keyof T],
        error: null,
        isTouched: false
      };
      return acc;
    }, {} as FieldSet<T>);
  }

  private async runValidation(): Promise<void> {
    this.isValidating = true;
    this.emit('validationStart');

    const values = this.getValues();
    const syncResults: Array<Errors<T> | null> = [];
    const asyncValidators: Array<Promise<Errors<T> | null>> = [];

    // Separate sync and async validators
    for (const validator of this.validators) {
      const result = validator(values);
      if (result instanceof Promise) {
        asyncValidators.push(result);
      } else {
        syncResults.push(result);
      }
    }

    // Merge sync validation results
    let errors: Errors<T> = {};
    for (const result of syncResults) {
      if (result) {
        Object.assign(errors, result);
      }
    }

    // If sync validators found errors, skip async validators
    if (Object.keys(errors).length > 0) {
      this.isValidating = false;
      this.emit('validated', values, errors);
      return;
    }

    // Run async validators in parallel
    if (asyncValidators.length > 0) {
      const asyncResults = await Promise.all(asyncValidators);
      for (const result of asyncResults) {
        if (result) {
          Object.assign(errors, result);
        }
      }
    }

    this.isValidating = false;
    this.emit(
      'validated',
      values,
      Object.keys(errors).length > 0 ? errors : null
    );
  }
}
