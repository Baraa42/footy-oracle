import { Ref, ref } from "vue";
import { SelectOption } from "../../interfaces/layout/SelectOption";

const languages: Array<SelectOption> = [{ value: "en", label: "English" }];
const selectedLanguage: Ref<SelectOption> = ref(languages[0]);

export const useLanguage = () => {
  return {
    languages,
    selectedLanguage,
  };
};
