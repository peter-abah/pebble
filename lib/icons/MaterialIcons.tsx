import { MaterialIcons } from "@expo/vector-icons";

import { cssInterop } from "nativewind";

cssInterop(MaterialIcons, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
    },
  },
});

export { MaterialIcons };
