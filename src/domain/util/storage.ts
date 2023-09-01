// 謎のエラーが出るので一旦無効化
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { atom } from 'jotai';
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

export function atomWithValidatedStorage<TSchema extends BaseSchema>(
  key: string,
  mapper: JsonMapper<TSchema>,
  initialValue: Output<TSchema>,
) {
  // localStorage に保存されているデータがあればそれで初期化する
  const data = parseJson(mapper.schema, localStorage.getItem(key), initialValue);

  // 初期値を localStorage に保存する
  const json = JSON.stringify(mapper.toInput(data));
  localStorage.setItem(key, json);

  const rootAtom = atom(data);

  return atom(
    (get) => {
      // 依存関係定義のため空の get を呼び出す
      get(rootAtom);
      return parseJson(mapper.schema, localStorage.getItem(key), initialValue);
    },
    (_, set, value: Output<TSchema>) => {
      // write 時に毎回 localStorage に保存する
      const json = JSON.stringify(mapper.toInput(value));
      localStorage.setItem(key, json);
      set(rootAtom, value);
    },
  );
}
