import axios, { AxiosRequestConfig } from "axios";
import { computed, Ref, ref, watch } from "vue";
import { useAlert } from "./layout/alert";

export const useApi = <T>(endpoint: string) => {
  const { showError } = useAlert();
  const api = axios.create({
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: Ref<T | undefined> = ref();

  const loading = ref(false);
  const error = ref();

  const post = (payload?: Record<string, any>) => {
    loading.value = true;
    error.value = undefined;

    return api
      .post<T>(endpoint, payload)
      .then((res) => (data.value = res.data))
      .catch((e) => {
        error.value = e;

        throw e;
      })
      .finally(() => (loading.value = false));
  };

  const get = (query?: Record<string, any>, config?: AxiosRequestConfig) => {
    loading.value = true;
    error.value = undefined;

    let queryString = "";

    if (query) {
      queryString =
        "?" +
        Object.entries(query)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");
    }

    return api
      .get<T>(endpoint + queryString, config)
      .then((res) => (data.value = res.data))
      .catch((e) => {
        error.value = e;

        throw e;
      })
      .finally(() => (loading.value = false));
  };

  const del = () => {
    loading.value = true;
    error.value = undefined;

    return api
      .delete<T>(endpoint)
      .then((res) => (data.value = res.data))
      .catch((e) => {
        error.value = e;

        throw e;
      })
      .finally(() => (loading.value = false));
  };

  const errorMessage = computed(() => {
    console.log("?? compute", error.value);

    if (error.value) {
      return error.value.message;
    }
  });

  const errorDetails = computed(() => {
    if (error.value && error.value.response) {
      return error.value.response.data.message;
    }
  });

  watch([error], () => {
    if (error.value?.response?.data?.message) {
      showError(error.value.response.data.message);
    }
    if (error.value?.response?.data?.error) {
      showError(error.value.response.data.error);
    }
  });

  return {
    loading,
    data,
    error,
    get,
    post,
    del,
    errorMessage,
    errorDetails,
  };
};
