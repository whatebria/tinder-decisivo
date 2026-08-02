import { View } from "react-native";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ShareOptions } from "./ShareOptions";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Grid 2x2 de canales sociales (whatsapp, twitter, email, copy). Cada uno con color de marca sutil. Se usa dentro de un Modal.",
  variants: [
    { label: "4 canales default", render: () => <View style={{ maxWidth: 400 }}><ShareOptions onShare={() => {}} /></View> },
    { label: "solo copy + email", render: () => <View style={{ maxWidth: 400 }}><ShareOptions onShare={() => {}} channels={["copy", "email"]} /></View> },
  ],
  props: [
    { name: "onShare", type: "(channel: ShareChannel) => void", required: true, description: "ShareChannel = 'whatsapp' | 'twitter' | 'email' | 'copy'" },
    { name: "channels", type: "ReadonlyArray<ShareChannel>", defaultValue: "['whatsapp', 'twitter', 'email', 'copy']" },
  ],
  snippet: `import { ShareOptions } from "@/components";

<ShareOptions
  onShare={(channel) => {
    if (channel === "copy") copyToClipboard(text);
    else if (channel === "whatsapp") openWhatsApp(text);
  }}
/>`,
};

export default showcase;
