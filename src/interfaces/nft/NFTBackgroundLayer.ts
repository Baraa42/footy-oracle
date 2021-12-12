export interface NFTBackgroundLayer {
  id: number;
  mode: "texture" | "gradient" | "color";
  color: String;
  gradientStart?: String;
  gradientStop?: String;
  gradientDirection?: String;
  colorMode?: String;
  texture?: String;
  opacity?: String;
  rotate?: String;
  translateX?: String;
  translateY?: String;
  blur?: String;
  scale?: String;
  class?: String;
  blendMode?: String;
}
