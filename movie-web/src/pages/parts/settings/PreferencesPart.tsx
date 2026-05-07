import { useTranslation } from "react-i18next";

import { Toggle } from "@/components/buttons/Toggle";
import { Heading1 } from "@/components/utils/Text";

export function PreferencesPart(props: {
  enableThumbnails: boolean;
  setEnableThumbnails: (v: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      <Heading1 border>{t("settings.preferences.title")}</Heading1>
      <div>
        <p className="text-white font-bold mb-3">
          {t("settings.preferences.thumbnail")}
        </p>
        <p className="max-w-[25rem] font-medium">
          {t("settings.preferences.thumbnailDescription")}
        </p>
        <div
          onClick={() => props.setEnableThumbnails(!props.enableThumbnails)}
          className="bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg"
        >
          <Toggle enabled={props.enableThumbnails} />
          <p className="flex-1 text-white font-bold">
            {t("settings.preferences.thumbnailLabel")}
          </p>
        </div>
      </div>
    </div>
  );
}
