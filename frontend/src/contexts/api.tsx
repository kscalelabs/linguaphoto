import type { paths } from "gen/api";
import { Client } from "openapi-fetch";

export default class api {
  public client: Client<paths>;

  constructor(client: Client<paths>) {
    this.client = client;
  }
}
