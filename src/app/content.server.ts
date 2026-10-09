import { Service } from "@angular/core";
import { ContentService } from "./content";
import { content } from "../../content";

@Service()
export class ContentServerService extends ContentService {
  constructor() {
    super();
    this.setDelegate(content);
  }
}
