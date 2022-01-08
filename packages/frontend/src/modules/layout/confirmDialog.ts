import { reactive } from "vue";
import { useToggle } from "./toggle";

export const useConfirmDialog = () => {
  const { isToggled: isConfirmDialogOpen, toggle: toggleConfrimDialog } = useToggle();
  const confirmDialog = reactive({
    type: "",
    action: "",
    icon: undefined,
    color: "",
    title: "",
    description: "",
    buttonText: "",
    onConfirm: async () => {},
    isToggled: isConfirmDialogOpen,
    toggle: toggleConfrimDialog,
  });

  return confirmDialog;
};
