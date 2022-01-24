import { Alert, AlertType } from "../../interfaces/layout/Alert";
import { reactive, watch } from "vue";

const alert: Alert = reactive<Alert>({
  show: false,
  type: "",
  title: "",
  message: "",
});

const alertTypes = AlertType;

const timeout = 5000; //ms

export const useAlert = () => {
  const showSuccess = (message: string) => {
    //console.info(message);
    alert.type = AlertType.SUCCESS;
    alert.message = message;
    alert.title = "Success!";
    alert.show = true;
  };

  const showError = (message = "Oops! Something went wrong, please try again later") => {
    //console.error(message);
    alert.type = AlertType.ERROR;
    alert.message = message;
    alert.title = "Error!";
    alert.show = true;
  };

  const close = () => {
    alert.show = false;
  };

  watch(
    () => alert.show,
    (selection) => {
      if (selection) {
        setTimeout(() => (alert.show = false), timeout);
      }
    }
  );

  return { alert, close, showError, showSuccess, alertTypes };
};
