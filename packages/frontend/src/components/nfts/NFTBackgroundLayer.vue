<script lang="tsx">
import { ref, Ref, watch, h, toRef, toRefs } from "vue";
import { useColors } from "../../modules/colors";
import { ColorPalette } from "../../interfaces/ColorPalette";
import { NFTBackgroundLayer } from "../../interfaces/nft/NFTBackgroundLayer";

export default {
  props: {
    data: {
      type: Object as () => NFTBackgroundLayer,
      required: true,
    },
  },
  setup(props: any) {
    const { generatePalette, getGradient } = useColors();
    const palette: Ref<ColorPalette> = ref(generatePalette(props.data.color));

    const baseClass = "absolute inset-0 z-10 " + props.data.class;
    const classes: Ref<any> = ref(baseClass);
    const styles: Ref<any> = ref({
      background: "",
      "mix-blend-mode": `${props.data.blendMode ? props.data.blendMode : "normal"}`,
      opacity: props.data.opacity,
      transform: `translate(${props.data.translateX ? props.data.translateX : 0}px, ${props.data.translateY ? props.data.translateY : 0}px) scale(${
        props.data.scale ? props.data.scale : 1
      }) rotate(${props.data.rotate ? props.data.rotate : 0}deg)`,
      filter: `blur(${props.data.blur}px)`,
    });

    watch(
      () => props.data.color,
      () => {
        palette.value = generatePalette(props.data.color);
        applyMode();
      }
    );

    watch(
      () => props.data.blendMode,
      () => {
        styles.value["mix-blend-mode"] = props.data.blendMode;
      }
    );

    watch(
      () => props.data.opacity,
      () => {
        styles.value["opacity"] = props.data.opacity;
      }
    );

    watch(
      () => [props.data.translateX, props.data.translateY, props.data.scale, props.data.rotate],
      () => {
        styles.value["transform"] = `translate(${props.data.translateX ? props.data.translateX : 0}px, ${
          props.data.translateY ? props.data.translateY : 0
        }px) scale(${props.data.scale ? props.data.scale : 1}) rotate(${props.data.rotate ? props.data.rotate : 0}deg)`;
      }
    );

    watch(
      () => props.data.blur,
      () => {
        styles.value["filter"] = `blur(${props.data.blur}px)`;
      }
    );

    watch(
      () => [props.data.colorMode, props.data.mode, props.data.texture, props.data.gradientStart, props.data.gradientStop, props.data.gradientDirection],
      () => applyMode()
    );

    const applyMode = () => {
      if (props.data.mode == "texture") {
        styles.value.background = "";
        classes.value = baseClass + " texture-" + props.data.texture;
      } else if (props.data.mode == "gradient") {
        classes.value = baseClass;
        if (props.data.gradientStart && props.data.gradientStop && props.data.gradientDirection) {
          styles.value.background = getGradient(
            (palette.value as any)[props.data.gradientStart],
            (palette.value as any)[props.data.gradientStop],
            props.data.gradientDirection
          );
        }
      } else if (props.data.mode == "color") {
        styles.value.background = (palette.value as any)[props.data.colorMode];
        classes.value = baseClass;
      }
    };
    applyMode();

    return () => h(<div class={classes.value} style={styles.value}></div>);
  },
};
</script>
