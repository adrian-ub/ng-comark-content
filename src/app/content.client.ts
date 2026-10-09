import { Service } from "@angular/core";
import { createContentClient } from "comark-content/client";
import { ContentService } from "./content";

@Service()
export class ContentClientService extends ContentService {
  constructor() {
    super();
    this.setDelegate(createContentClient());
    if (typeof EventSource !== "undefined") {
      const events = new EventSource("/__content_hmr");
      events.onmessage = () => {
        this.changeVersion.update((version) => version + 1);
      };
    }
  }
}
