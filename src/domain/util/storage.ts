// 謎のエラーが出るので一旦無効化
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { safeParse, type BaseSchema, type Input, type Output } from 'valibot';

export type JsonMapper<TSchema extends BaseSchema> = {
  schema: TSchema;
  toInput: (value: Output<TSchema>) => Input<TSchema>;
};

function parseJson<TSchema extends BaseSchema>(
  schema: TSchema,
  json: string | null,
  initialValue: Output<TSchema>,
): Output<TSchema> {
  if (json === null) {
    return initialValue;
  }

  const result = safeParse(schema, JSON.parse(json));
  if (result.success) {
    return result.data;
  } else {
    console.warn('Storage Parse Error', result.error);
    return initialValue;
  }
}

export function atomWithStorageAndValidation<TSchema extends BaseSchema>(
  key: string,
  mapper: JsonMapper<TSchema>,
  initialValue: Output<typeof mapper.schema>,
) {
  return atomWithStorage(key, initialValue, {
    getItem(key, initialValue) {
      const json = localStorage.getItem(key);
      return parseJson(mapper.schema, json, initialValue);
    },
    setItem(key, newValue) {
      localStorage.setItem(key, JSON.stringify(mapper.toInput(newValue)));
    },
    removeItem(key) {
      localStorage.removeItem(key);
    },
    subscribe(key, callback, initialValue) {
      const listener = (event: StorageEvent) => {
        if (event.storageArea !== localStorage || event.key !== key) {
          return;
        }
        callback(parseJson(mapper.schema, event.newValue, initialValue));
      };
      window.addEventListener('storage', listener);

      return () => {
        window.removeEventListener('storage', listener);
      };
    },
  });
}

export function atomWithValidatedStorage<TSchema extends BaseSchema>(
  key: string,
  mapper: JsonMapper<TSchema>,
  initialValue: Output<TSchema>,
) {
  const rootAtom = atomWithStorage(key, JSON.stringify(mapper.toInput(initialValue)));
  return atom(
    (get) => {
      const json = get(rootAtom);
      return parseJson(mapper.schema, json, initialValue);
    },
    (_, set, value: Output<TSchema>) => {
      set(rootAtom, JSON.stringify(mapper.toInput(value)));
    },
  );
}
