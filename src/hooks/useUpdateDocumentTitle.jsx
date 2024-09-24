import { useEffect } from "react";
import { capitalize } from "../utils";

const useUpdateDocumentTitle = (basin) => {
  useEffect(() => {
    if (basin) {
      document.title = `${capitalize(basin)} Basin`;
    }
  }, [basin]);
};

export default useUpdateDocumentTitle;
