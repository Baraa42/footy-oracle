<template>
  <transition
    enter-active-class="transform transition ease-in-out duration-500"
    :enter-from-class="getEnterFromClasses()"
    :enter-to-class="getEnterToClasses()"
    leave-active-class="transform transition ease-in-out duration-500"
    :leave-from-class="getLeaveFromClasses()"
    :leave-to-class="getLeaveToClasses()"
  >
    <slot></slot>
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from "vue";

enum Direction {
  "TOP" = "top",
  "BOTTOM" = "bottom",
  "LEFT" = "left",
  "RIGHT" = "right",
}

export default defineComponent({
  props: {
    duration: {
      type: String,
      default: "duration-500",
    },
    from: String as PropType<Direction | String>,
    "xs-from": String as PropType<Direction | String>,
    "sm-from": String as PropType<Direction | String>,
    "md-from": String as PropType<Direction | String>,
    "lg-from": String as PropType<Direction | String>,
    "xl-from": String as PropType<Direction | String>,
  },
  setup(props: any) {
    const propsKeys = toRefs(props);

    // TODO tailwind don't find this dynamic generated classes with breakpoints

    const slideFromTopClasses: any = {
      enterFromClass: "-translate-y-full",
      enterToClass: "translate-y-0",
      leaveFromClass: "translate-y-0",
      leaveToClass: "-translate-y-full",
    };

    const slideFromBottomClasses: any = {
      enterFromClass: "translate-y-full",
      enterToClass: "translate-y-0",
      leaveFromClass: "translate-y-0",
      leaveToClass: "translate-y-full",
    };

    const slideFromRightClasses: any = {
      enterFromClass: "translate-x-full translate-y-0", // lg:translate-x-full lg:translate-y-0
      enterToClass: "translate-x-0", // lg:translate-x-0
      leaveFromClass: "translate-x-0",
      leaveToClass: "translate-x-full translate-y-0",
    };

    const slideFromLeftClasses: any = {
      enterFromClass: "-translate-x-full",
      enterToClass: "translate-x-0",
      leaveFromClass: "translate-x-0",
      leaveToClass: "-translate-x-full",
    };

    const formatClassesWithBreakpoints = (
      classes: string,
      breakpoint: string
    ): string => {
      let withBreakpoints: string = "";
      classes.split(" ").forEach((item: string) => {
        if (item.length !== 0) {
          withBreakpoints += `${breakpoint}:${item} `;
        }
      });
      return withBreakpoints;
    };

    const getClassesFromState = (state: string): string => {
      let classes = "";

      Object.keys(propsKeys)
        .filter((key: string) => key.toLowerCase().includes("from"))
        .forEach((prop: string) => {
          const direction = props[prop];
          const breakpoint = prop.toLowerCase().replace("from", "");

          switch (direction) {
            case "left":
              classes +=
                breakpoint.length !== 0
                  ? formatClassesWithBreakpoints(
                      slideFromLeftClasses[state],
                      breakpoint
                    )
                  : slideFromLeftClasses[state];
              break;
            case "right":
              classes +=
                breakpoint.length !== 0
                  ? formatClassesWithBreakpoints(
                      slideFromRightClasses[state],
                      breakpoint
                    )
                  : slideFromRightClasses[state];
              break;
            case "top":
              classes +=
                breakpoint.length !== 0
                  ? formatClassesWithBreakpoints(
                      slideFromTopClasses[state],
                      breakpoint
                    )
                  : slideFromTopClasses[state];
              break;
            case "bottom":
              classes +=
                breakpoint.length !== 0
                  ? formatClassesWithBreakpoints(
                      slideFromBottomClasses[state],
                      breakpoint
                    )
                  : slideFromBottomClasses[state];
              break;
            default:
              break;
          }
          classes += " ";
        });
      return classes;
    };

    const getEnterFromClasses = () => {
      return getClassesFromState("enterFromClass");
    };

    const getEnterToClasses = () => {
      return getClassesFromState("enterToClass");
    };

    const getLeaveFromClasses = () => {
      return getClassesFromState("leaveFromClass");
    };

    const getLeaveToClasses = () => {
      return getClassesFromState("leaveToClass");
    };

    return {
      getEnterFromClasses,
      getEnterToClasses,
      getLeaveFromClasses,
      getLeaveToClasses,
    };
  },
});
</script>
