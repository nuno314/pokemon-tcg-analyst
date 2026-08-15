import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  getDictionary,
  LOCALE_COOKIE,
  localeToHtmlLang,
  parseLocale,
  type Dictionary,
  type Locale,
} from "./index";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE);
}

export async function getServerDictionary(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

export { getDictionary, localeToHtmlLang, parseLocale, type Dictionary, type Locale };
