import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/actions/i18n";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
