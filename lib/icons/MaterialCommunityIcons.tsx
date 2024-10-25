import { MaterialCommunityIcons } from "@expo/vector-icons";

import { cssInterop } from "nativewind";

cssInterop(MaterialCommunityIcons, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
    },
  },
});

export { MaterialCommunityIcons };
