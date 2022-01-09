import { Component } from "vue";

export interface Chain {
  name: string;
  chainId: string;
  icon: Component;
  iconClass?: string;
}
