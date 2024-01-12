// @ts-nocheck

import { createI18n } from 'vue-i18n';
import { nextTick } from "vue";
import { fetchHocon } from "./BlueMap/Utils";

export const i18nModule = createI18n({
	locale: 'en',
	fallbackLocale: 'en',
	silentFallbackWarn: true,
	warnHtmlMessage: false,
	legacy: false,
	messages: {}
});

export const i18n = i18nModule.global;

export async function setLanguage(lang) {
	try {
		if (!i18n.availableLocales.includes(lang)) {
			let messages = await fetchHocon("https://map.90gq.se/" + `lang/en.conf`);
			i18n.setLocaleMessage(lang, messages);
		}

		i18n.locale.value = lang;

		document.querySelector('html').setAttribute('lang', lang);
	} catch (e) {
		console.error(`Failed to load language '${lang}'!`, e);
	}

	return nextTick();
}

export async function loadLanguageSettings() {
	let settings = await fetchHocon("https://map.90gq.se/" + `lang/settings.conf`);
	i18n.languages = settings.languages;
	await setLanguage(settings.default);
}
