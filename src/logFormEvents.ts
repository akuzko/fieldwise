import { Form as FormClass } from './Form';
import type { Values, Form, DebugMode, DebugModeConfig } from './Form';

const allEventTypes = [
  'change',
  'changeMany',
  'reset',
  'errors',
  'validate',
  'validated'
] as const;

const isDebugModeObject = (mode: DebugMode): mode is DebugModeConfig => {
  return typeof mode === 'object' && mode !== null && Array.isArray(mode.only);
};

export default function logFormEvents<T extends Values>(form: Form<T>): void {
  const eventsToLog = isDebugModeObject(FormClass.debugMode)
    ? FormClass.debugMode.only
    : allEventTypes;

  eventsToLog.forEach((eventType) => {
    form.on(eventType, (...args) => {
      console.log(
        `[Form Event] ${eventType}:`,
        ...(args.length === 0 ? ['[no payload]'] : args)
      );
    });
  });
}
